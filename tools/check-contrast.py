#!/usr/bin/env python3
"""Check every text/ground pair on the street against WCAG.

The zine table says in its own words that "clashing is not the same as illegible",
and Your Room makes 4.5:1 a condition of taking the keys. A claim like that has to
be checkable or it is decoration. This is the check.

Large text (>=24px, or >=18.66px bold) is held to 3:1 per WCAG 1.4.3; everything
else to 4.5:1. Each pair below names where it is used so a failure is findable.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def lum(hexstr):
    h = hexstr.lstrip("#")
    c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

def declared():
    """Every hex value in love.css's :root, as lowercase strings.

    WHY THIS EXISTS. This file keeps its own copies of the site's colours, which
    is fine right up until one of them drifts -- and one did: --cedar was
    lightened in the stylesheet so a drawing's outline would pass, and the copy
    here stayed on the old value. The pair that caught it was measuring a colour
    no longer on the site, which is a checker reporting confidently about
    nothing. Rather than trust care, the run below refuses if a colour is
    declared in :root and appears nowhere in this file.

    It is a coverage check and not an equality check, on purpose: several
    grounds here are composites nobody declared (GLOW, SHAFT, LAMPLIT, the
    scanline tints) and several :root colours are deliberately measured through
    a composite instead. What it can say for certain is that a value declared
    over there is known over here."""
    src = (ROOT / "love.css").read_text()
    root = src[src.index(":root {"):src.index("\n}", src.index(":root {"))]
    # COMMENTS STRIPPED FIRST. That block explains itself at length, and the
    # explanations quote colours -- including #8a7462, the one value of Helen's
    # this repo changed, which is written down there precisely so it is not
    # forgotten. Reading it as a declaration made this tool demand a measurement
    # for a colour that is not on the site.
    root = re.sub(r"/\*.*?\*/", " ", root, flags=re.S)
    return {h.lower() for h in re.findall(r"#[0-9A-Fa-f]{6}", root)}


INK, INK2, INK3 = "#15121f", "#241d33", "#4a3f67"
CHALK, CREAM, PAPER = "#c8bfe0", "#FFF3E6", "#EDEAE2"
PINK, HOT, ORANGE, YELLOW = "#FF2D95", "#FF3D9A", "#FF8A00", "#FFE100"
GREEN, CYAN, VIOLET, RED = "#22E06A", "#00D4FF", "#AC5BFF", "#C4002B"
BLUE, VIOLET_DEEP = "#1770C2", "#7B28DD"
NAVE, NICHE, GLASS, LEAF = "#1A0A33", "#170A2B", "#0E0520", "#F0C453"
DUSK, SPRUCE, BARK = "#0E1A18", "#13241F", "#2A3A31"
BONE, LICHEN, MOSS, MOON = "#EFE9DC", "#C6D2C4", "#8FAE88", "#E7D9A8"
HEARTH, TENT, CANVAS, CANVAS_2 = "#150F0E", "#1B1310", "#241A16", "#2C1F19"
CARPET, CAB, CRT = "#160A26", "#241038", "#06171C"
COIN, MINT, ZAP = "#FFC21A", "#4BF0C6", "#FF6BE4"
TUBE, TUBE2 = "#B9C6D6", "#9AA7BA"
TALLOW, TALLOW2, TALLOW3 = "#F2E6D4", "#C2AC91", "#A4907B"
# The two colours that exist only inside the campground's pitch drawings, and
# nowhere in the stylesheet: they are a picture's inks rather than a room's
# palette, the same way the stream's and the crown's are. SUNFLOWER is the
# hermitage's flower heads; SCREEN is its one lit window, which is a laptop and
# not a flame -- the structural opposite of the yurt's candle next to it.
SUNFLOWER, SCREEN = "#E8C33A", "#A3D4DF"
# The Solarpunk Hermitage (love.css §19), and THE FIRST ROOM ON THIS STREET
# WHOSE TYPE IS DARK ON LIGHT ALL THE WAY DOWN. Which inverts the usual job of
# this file: everywhere else the risk is an ink too dim against a dark ground,
# and here it is an ink too PALE against a bright one -- so the accents are the
# dangerous colours rather than the greys, and --bloom was darkened twice before
# it passed on the noon ground.
NOON, NOON2 = "#F7F3E6", "#ECE6D2"
SKY_H, SKY_2 = "#BCDDEA", "#E4F0F1"   # --daysky, --daysky-2
FURROW, FURROW2 = "#16291C", "#34483A"
SPROUT, SPROUT2, BLOOM = "#2C6B45", "#1D4D30", "#B5760A"   # --sprout, --sprout-2
# The cabin drawing's own inks, which are a picture's and not the room's --
# hardcoded in the page the way the campground's stream and the yurt's crown
# are. They are NOT the UI green: that one has to carry pale type on a button,
# and these have to carry a dark outline and a darker detail line, and one
# colour cannot be asked to do both. The band and the timber were each lightened
# once after this file refused them.
MEADOW, MEADOW_LINE, TIMBER_H = "#3E8A5A", "#0E2A19", "#9A6A3C"
CEDAR, CELL = "#9A6A3C", "#12323C"
VELVET, VELVET2, VELVET3 = "#4A1220", "#5E1A2B", "#380C18"
# The campfire's furniture. THE BRIGHT CHAIRS CANNOT CARRY THEMSELVES: every one
# of them measured under 2.3 against the rug, which is a chair you cannot pick
# out of the carpet -- the canopy problem, arriving as upholstery. So every
# object in that scene is carried by its OUTLINE in FURROW, measured against the
# rug on one side and its own fill on the other, which is the pebbling cabinet's
# reading of WCAG 1.4.11 in a room with furniture in it. The television is the
# one exception: it is dark enough to separate from the rug by itself.
TURF = "#3F8E4C"
BAG1, BAG2, BAG3 = "#F59A2E", "#F0559F", "#3FC7B4"
BAKELITE, TELLY_OFF, TELLY_LIT, TELLY_DIM = "#2A2621", "#0C1110", "#F1EFE4", "#A9B4AB"
BAKELITE_2 = "#7E7466"   # the set's brand strip; see the note on it below
IVY, IVY_2, TIMBER = "#6D8A56", "#38491F", "#3A2A20"
PEB_PRESS = "#1F6B55"
# Club Chronic (love.css §20). A BLACK WALL WITH PAPER STUCK TO IT, which makes
# it the other room here whose type runs both ways -- light on the wall, dark on
# the flyers -- and the flyers are a hundred small grounds rather than one big
# lit one. STAGE_LIT is nobody's choice: --marker at .07 over --brick, the wash
# the one working bulb puts on the wall near the stage, and what the type up
# there actually sits on.
BRICK, BRICK_2, GRIME = "#131113", "#1E1B1E", "#2A262A"
PASTE, PASTE_2, NEWSPRINT = "#E9E4D6", "#CFC8B6", "#A8A296"
MARKER, SIREN, BOOTBLACK = "#D8FF3A", "#FF5A5A", "#0B0A0B"
# The staples. --newsprint measured 2.00 on flyer stock, which is a fixing you
# cannot see holding up a thing you can, so they are their own darker grey.
STAPLE = "#6E6A60"
STAGE_LIT = "#212216"
WICK, WICK2, GILT = "#F6E8D0", "#DCC49C", "#E9C270"
# And the cave's composite, which nobody chose: --wick at .05 over the velvet is
# the brightest the EVEN light makes that ground, and it is what the type down
# there actually sits on. Same rule as the Chappell's rose window and the
# burrow's lamp pool -- the flat colour is never the whole story.
VELVET_LIT = "#521C29"
EMBER, EMBER2, CANDLE = "#E0904A", "#F2B673", "#E9C874"
# What the yurt's canvas weave and its ember crown actually make, composited:
# #150F0E, then cream at .016 and .022 for the two hatches, then the ember
# glow at .10. Nobody wrote this colour; it is the one the type sits on.
GLOW = "#31231A"
# The Arcade's two composites, neither of which anybody chose either. CRT_LIT is
# --crt under the scanline stripe (white at .035), and it is the LIGHTER of the
# two grounds the playfield makes, so it is the one that decides. SPILL is the
# carpet under the cabinet's own glow (--coin at .10), which is where the
# headline and the eyebrow sit.
CRT_LIT = "#0F1F24"
SPILL   = "#2D1C25"
# The otter cabinet's screen is water, which has two grounds of its own -- the
# shoal above and the deep below -- and therefore two more scanline composites.
# SHOAL_LIT is the lighter of the four and is what decides every ink in the bay.
BAY, SHOAL = "#06202A", "#0A3240"
BAY_LIT, SHOAL_LIT = "#0F2831", "#133947"
PELT, WHISKERS = "#D29A6B", "#F0D6B4"
# The pebbling cabinet's screen is PALE, which is a different contrast problem.
# Everything on a shingle beach is a mid-tone including the shingle, so the
# objects there are carried by their OUTLINE and not by their fill: PEN_DARK
# draws every pebble, penguin and nest. That is the honest reading of WCAG
# 1.4.11, which asks about the contrast with ADJACENT colours rather than about
# a fill against a distant background -- so the outline is measured against the
# three grounds, and each fill against the outline that surrounds it. The
# scanline on this screen is dark rather than light, which makes the un-striped
# base the lightest ground and therefore the only one worth checking.
#
# HOLDING THE FILLS TO 4.5 AGAINST THE OUTLINE SQUEEZES THEM ALL LIGHT, which
# is why the six things you can carry are six different SHAPES and not six
# ellipses in six colours: a narrow band of light tones is a narrow band of
# things nobody can tell apart at sprite size. Shape carries it, and the name
# said out loud on every pick-up carries it again.
LOAM, BURROW, RECESS = "#241B12", "#2E2317", "#17120C"
PLASTER, PLASTER_2 = "#E8D8BC", "#D8C5A3"
UMBER, UMBER_2 = "#3A2A1C", "#5A4230"
OAT, OAT_2 = "#EFE4D2", "#C9B99F"
LAMP, DOOR_G, RUST, BEAM, BRASS = "#F0C36B", "#2F5A3C", "#8A3A1E", "#7A5330", "#E3BB6A"
# The three woods a case is made of, lightest first -- the lightest is the one
# that decides for anything brass screwed to it.
WOOD_1, WOOD_3 = "#8A5F38", "#5E3F23"
SCALE = "#F6EBD2"   # the tuning strip, and the lighter end of its own gradient
# The Latibulum's composite, and nobody chose it either: --lamp at .16 over the
# loam, which is the brightest the lamp pool gets. Every ink on the earth ground
# is held against THIS as well as against the flat colour.
LAMPLIT = "#453620"
# And the two the shelf tiles make -- white at .34 over each end of the plaster
# gradient. The DARKER of them is the one that decides, which is the opposite of
# the rule everywhere else on this street, because this is the only room whose
# type is dark on a light ground.
TILE, TILE_2 = "#F0E5D3", "#E5D9C2"
SKY, SEA, SHINGLE = "#D6DFE4", "#8FA9B8", "#B4AEA5"
PEN_DARK, PEN_LIGHT, BEAK = "#1E2833", "#F7FAFB", "#E07B1F"
PEB_GREY, PEB_WHITE, PEB_GLASS = "#A8B0B8", "#EDE9E2", "#6FBFA4"
PEB_SPECK, PEB_FEATHER, PEB_SHELL, NEST = "#B09A7E", "#8494A8", "#E8A874", "#A69C90"
KELP, KELP2 = "#6FB050", "#7ABF5A"
# THE JUNGLE ROOM (love.css §17). Wet green under a closed roof, and the room
# where the composite matters more than anywhere else on the street, because the
# light is the whole conceit: three shafts and a wide opening at the top of the
# page, all of them --sun over the ground. SHAFT is the brightest of them over
# the canopy (--sun at .12) and SHAFT_2 is the same light landing on an
# understorey panel; between them they are what nearly every word here is
# actually read against, and the flat colours below are the easy case.
CANOPY, UNDERSTORY, BUTTRESS, LITTER = "#06180F", "#0B2415", "#143A24", "#1C2A14"
SHAFT, SHAFT_2 = "#232E1A", "#27391F"
APERTURE = "#041209"        # what a screen is before it is a picture
DAYLIGHT, SAP = "#EDF6E2", "#BFD6AC"
PALM, HELICONIA, SUN, ORCHID = "#57A05C", "#FF8557", "#F5D06B", "#E98AD2"
# The lightest of the three greens the canopy band is drawn in. It is ambient
# decoration and WCAG does not reach it, and it is measured anyway at the
# graphics bar: a canopy nobody can make out is not a canopy, it is a dark strip
# across the top of the page pretending to be one. THE FIRST THREE GREENS FAILED
# THAT, at 2.18 -- the band read as a smudge and the leaves in it could not be
# told from each other, which is exactly what measuring a decoration is for.
CANOPY_LEAF = "#31754A"
# THE DEN (love.css §18), the subroom behind the Jungle Room, and the one pair
# of rooms on this street that share a name AND a colour. What keeps them apart
# is in these numbers: upstairs the green is the DARK GROUND and the type is
# cream on it; down here the green is the BRIGHT GROUND, it is the carpet, and
# the track list is set dark on it. Same hue, opposite job, and therefore two
# entirely different sets of pairs. LAMPLIT_DEN is nobody's choice: --tiki at
# .14 over the panelling, the brightest a low lamp gets in a room with no
# daylight in it at all.
PANEL, TEAK, STONE = "#241508", "#3C2412", "#A06A4E"

# The Pebble Board (love.css §21). The fixture first, then Norah's paper.
PBNIGHT, PBFRAME, PBFRAME_LIT = "#14120F", "#2E4640", "#486A61"
PBCORK, PBLAMP, PBCHALK = "#6B4F35", "#F6E3B8", "#C9C2B4"
PBPLATE, PBPLATE_INK = "#B99B55", "#1B1509"
PBPAPER, PBPAPER_DEEP, PBCARD = "#EDE3CC", "#E3D6B8", "#FBF8F1"
PBINK, PBSOFT = "#2B2621", "#574F46"
PBGOLD, PBGOLD_BG = "#8A6D2F", "#FFF3D0"
PBMEM, PBMEM_CARD, PBMEM_INK = "#322D27", "#3D3730", "#DED6C6"
PBMEM_HEAD, PBMEM_CREDIT = "#F3EDDF", "#C7BEB0"
PBMEM_GOLD, PBMEM_LINK = "#C9A227", "#D4AF37"
LAMPLIT_DEN = "#412B10"
SHAG, SHAG_2 = "#63B441", "#57A438"
COCONUT, RATTAN = "#F6ECD9", "#CBB392"
COCOA, COCOA_2 = "#1E1107", "#35210F"
# AND THE GROUND UNDER A TRACK CARD IS NOT THE CARPET. A cut is a pane of
# --coconut at .78 LAID ON the shag, so the type on it sits on what those two
# make and not on the green — which is the composite lesson this file keeps
# learning, room after room, arriving here in the place it is easiest to miss,
# because the carpet is the thing you actually see. The shag itself carries the session
# heading and its date, and those ARE measured against it below.
CUT, CUT_2 = "#D6E0B8", "#D3DCB6"
TIKI, JADE, RUM = "#F0B040", "#37C9A4", "#F2705A"
FISHY, COBBLE, SHELLY, URCHIN = "#CFE2F2", "#A9BAC6", "#E8D6B6", "#B79AE0"

# (fg, bg, large?, where)
# The Mopery (§22). A COLD GROUND WITH WARM POINTS ON IT: the candles light a
# foot of the room and the walls stay stone, which is the entire separation from
# the four warm enclosed rooms on this street. Nine spines, nine measured pairs
# -- a shelf with one unreadable title on it is a shelf whose reader cannot tell
# which book is broken.
MOP_NIGHT, MOP_STONE, MOP_SHELF, MOP_DEEP = "#10141A", "#1A2027", "#232B34", "#080B0E"
MOP_BONE, MOP_DIM, MOP_GILT, MOP_FLAME = "#EAE4D6", "#A7AFB9", "#D3AB58", "#F3B95F"
MOP_OXBLOOD, MOP_SUGAR, MOP_INKSPINE = "#6B2028", "#D8BCC6", "#232A42"
MOP_GRAPHITE, MOP_TAR, MOP_WINE = "#474D55", "#15181C", "#5C2033"
MOP_VELLUM, MOP_DUST, MOP_MOSS = "#D8CBA6", "#8C8271", "#44523D"

# The Oracle Deck (§23). Ash and vermilion, no blue anywhere, because the
# library it hangs off is blue-black all over.
ORC_SLATE, ORC_DEEP, ORC_CUT = "#23201E", "#131110", "#F2EDE4"
ORC_DIM, ORC_RED, ORC_BRASS = "#B0A69B", "#E8724A", "#B99154"

# The Doomscroll (§24). Foxed newsprint on a dark desk -- the only pale ground
# on this side of the street, and the thing that keeps it off the zine table is
# that this paper is warm and grey where a photocopy is stark white.
DSC_DESK, DSC_PAPER, DSC_PAPER2 = "#211D18", "#DCD7CC", "#CFC8BA"
DSC_INK, DSC_INK2, DSC_RED, DSC_BONE = "#1A1714", "#4A423A", "#8C1D18", "#EAE4D6"

# Swaying Sweetgrass (§25), pitch 02 in the campgrounds. A meadow lit from
# BEHIND — the sun low and a hundred feet off, the light coming through the
# blades rather than falling on them, which is why the greens go yellow and the
# ground stays dark. SUNWASH is the composite nobody chose: --seed at .10 over
# --soil, the wash the last of the light lays over the top of the page, and what
# the type up there is really on.
# PREFIXED, because GLOW was already the Faery Yurt's ember composite two
# hundred lines up and an unprefixed one here silently repainted six of Helen's
# pairs — six FAILs in a room nobody had touched. That is the --leaf collision
# in love.css arriving in this file's own Python, which is where it was caught
# the first time and fixed only there. The rule is the same in both: rename the
# newcomer, and when a name collides, look for the same collision everywhere
# else that holds names.
SWG_SOIL, SWG_SHADE, SWG_STRAW = "#141A0C", "#1D2612", "#EFE6C6"
SWG_AWN, SWG_GLOW, SWG_SEED = "#C4C08E", "#D7E06A", "#E3C85C"
SWG_BAND, SWG_SEDGE, SWG_STEM = "#D9C6E8", "#8FA05A", "#4E6B2E"
SWG_WASH = "#26280F"

# The Adventurer's Guild (§26). Manila and printer's ink -- the SECOND pale
# ground on a dark street, and the one that could have fallen through to the
# base stylesheet's `a` the way the Doomscroll's links did. The room declares
# its own link colour at the room, which is what gives this file a pair to hold
# in the first place: an inherited colour was never DECIDED, so nothing here
# would have had anything to measure and the run would have passed while a
# paragraph of links sat at about 2.4 on paper.
# GU_ prefixed on purpose. PAPER is already the zine's, INK is already the
# street's, and STAMP is already a :root name for the Doomscroll's typewriter
# grey -- the --leaf collision, pre-empted this time rather than discovered.
GU_PAPER, GU_PAPER2, GU_INK = "#E8E1CF", "#D8CFB6", "#1E241F"
GU_INK2, GU_RULE, GU_STAMP, GU_FILE = "#4C5349", "#A2977E", "#9E2B1B", "#1C3B6E"

PAIRS = [
    (PINK,    INK,  True,  "street: tagline 'Queer without fear' 25px Archivo Black"),
    (ORANGE,  INK,  True,  "street: tagline 'Interdependent and here' 25px"),
    (GREEN,   INK,  True,  "street: tagline 'Divergent and proud' 21px bold display"),
    (CYAN,    INK,  True,  "street: tagline 'Living out loud' 27px"),
    (YELLOW,  INK,  False, "street: tagline 'Plucky pluralism' 16px Rock Salt"),
    (VIOLET,  INK,  True,  "street: tagline 'ribald songing' 30px VT323"),
    ("#ffffff", INK, True, "street: wordmark"),
    (CHALK,   INK2, False, "street: pavement + dial fine print"),
    (YELLOW,  INK2, False, "street: pavement links, dial label"),
    (CHALK,   INK,  False, "plain rooms: lede"),
    (YELLOW,  INK,  False, "plain rooms: links"),
    ("#ffffff", INK, False, "plain rooms: body copy"),
    (INK,     YELLOW, False, "marquee text; zine 'keeps' panel"),
    ("#2b0a1c", HOT, False, "pony: lede + door blurb on hot pink"),
    (CREAM,   HOT,  True,  "pony: h1 and h2 on hot pink"),
    (YELLOW,  "#2b0a1c", True, "pony: consent banner heading"),
    ("#ffd9ec", "#2b0a1c", False, "pony: consent banner body"),
    ("#2b0a1c", "#ffffff", False, "pony: track titles on the jukebox card"),
    ("#6b3a55", "#ffffff", False, "pony: track notes"),
    (INK,     PAPER, False, "zine: body copy on paper"),
    ("#2e2a22", PAPER, False, "zine: secondary copy on paper"),
    (RED,     PAPER, False, "zine: shout line + scrawl"),
    (PAPER,   INK,  False, "zine: pullquote body"),
    ("#b9b2a3", INK, False, "zine: pullquote citation"),
    (PAPER,   RED,  True,  "zine: ransom 'PHASE'"),
    (INK,     CYAN, True,  "zine: ransom 'A' (#1) and 'RAINBOWS' (#2)"),
    (CYAN,    "#05060f", True,  "quantum: h1"),
    ("#d8d4ff", "#05060f", False, "quantum: lede and body"),
    ("#a6a1d4", "#05060f", False, "quantum: citations"),
    ("#8c87bd", "#05060f", False, "quantum: footnote"),
    (GREEN,   "#05060f", False, "quantum: backlink + helen link"),
    (CYAN,    "#05060f", False, "quantum: reading titles in the audio room"),
    ("#05060f", GREEN, False, "quantum: sequence control while playing"),
    ("#8c87bd", "#05060f", False, "quantum: sequence control when nothing is recorded"),
    (PINK,    "#05060f", False, "quantum: terminal lines 22px"),
    (GREEN,   "#101014", True,  "enid: h1"),
    ("#ece8f5", "#101014", False, "enid: body"),
    ("#b9b5c9", "#16161d", False, "enid: panel secondary copy"),
    (PINK,    "#16161d", False, "enid: panel heading"),
    ("#101014", GREEN, False, "enid: sticker DISABLED"),
    ("#101014", YELLOW, False, "enid: sticker monotropic"),
    ("#101014", CYAN, False, "enid: sticker QUEER"),
    ("#101014", PINK, False, "enid: sticker AUTISTIC"),
    ("#ffffff", RED, False, "enid: sticker 'not a phase'"),
    (YELLOW,   BLUE, True,  "playhouse: h1 (has a black shadow too)"),
    ("#ffffff", BLUE, False, "playhouse: lede, backlink, door--play blurb"),
    ("#101014", YELLOW, False, "playhouse: stim box toy"),
    ("#3a3200", YELLOW, False, "playhouse: stim box body copy"),
    ("#0a3a1c", GREEN, False, "playhouse: chairy body copy"),
    ("#efe2ff", VIOLET_DEEP, False, "playhouse: word clock body copy"),
    ("#ffffff", VIOLET_DEEP, False, "playhouse: word clock title"),
    ("#3d2100", ORANGE, False, "playhouse: yell button body copy"),
    ("#101014", "#ffffff", False, "playhouse: house rules"),
    (YELLOW,  "#101014", False, "playhouse: the says-box and the floor tag"),
    (YELLOW,   RED, False, "playhouse: secret-word label 13px"),
    ("#ffffff", RED, True,  "playhouse: the secret word itself"),
    ("#ffe0e2", RED, False, "playhouse: secret-word small print"),

    # THE SOUND BOARD, which is seven grounds rather than one. Six bright keys
    # carrying the room's own near-black, and a black mood key underneath them
    # carrying three lit inks -- and the mood ink is on the WORD as well as on
    # the drawn line, so these are body-text pairs and not graphics ones. The
    # three were picked because they are the brightest this site has that clear
    # the body threshold on near-black: yellow at 14.5, cyan at 10.7 and orange
    # at 8.0. Red was the obvious colour for angry and it is 3.06 there, which
    # is why angry is orange -- the mood the room wanted least to make illegible
    # is the one whose obvious colour fails.
    ("#101014", CYAN,   False, "playhouse: the sound board's RAIN key"),
    ("#101014", ORANGE, False, "playhouse: the sound board's CHIME key"),
    ("#101014", PINK,   False, "playhouse: the sound board's PURR key"),
    ("#101014", VIOLET, False, "playhouse: the sound board's SQUEAK key"),
    (CREAM,    "#101014", False, "playhouse: the mood keys' names and blurbs"),
    (CYAN,     "#101014", False, "playhouse: a mood key set to sad"),
    (ORANGE,   "#101014", False, "playhouse: a mood key set to angry"),
    ("#9d8cc8", INK2, False, "street: the empty storefront's 'to let'"),
    (INK,      GREEN, False, "dial: Gentle when pressed"),
    (INK,      CYAN,  False, "dial: Regular when pressed"),
    (INK,      PINK,  False, "dial: MAX GLITTER when pressed"),
    (CREAM,    INK2, False, "pony: facade button label"),
    ("#3a3644", "#ece8f5", False, "enid: polaroid caption"),
    (GREEN,    "#16161d", False, "enid: boombox PLAY + panel links"),
    ("#7d7a8c", "#101014", False, "enid: the room-05 line"),
    ("#7f7aad", "#05060f", False, "quantum: the room-04 line"),
    ("#4a4437", PAPER, False, "zine: the issue line"),
    (VIOLET,   "#05060f", False, "quantum: superposition heading"),
    (VIOLET,   INK,  False, "street: violet tagline + any violet ink on the night ground"),

    # THE CHAPPELL (love.css §12). A subroom with its own ground, its own gold
    # and its own ambient layer, so it gets its own pairs rather than leaning on
    # the dancefloor's -- which is the whole point of it being a separate world.
    #
    # #4E2E60 IS NOT A COLOUR ANYBODY WROTE. It is what the rose window actually
    # makes: violet at .22 composited over the #1A0A33 nave, then the gold rays
    # at .10 over that. Enid's card and the pony's headline both taught this file
    # that a room's flat background is not the ground its text sits on, and the
    # only way that lesson stays learned is if the composite is in the list.
    (LEAF,      NAVE,  True,  "chappell: h1 in Monoton, 30-58px gold on the nave"),
    (LEAF,      "#4E2E60", True, "chappell: h1 where the rose window peaks"),
    ("#EFE4FF", NAVE,  True,  "chappell: the serif lede, 20-27px"),
    ("#EFE4FF", "#4E2E60", True, "chappell: the lede under the rose window"),
    ("#EFE4FF", NICHE, False, "chappell: votive banner body, 15px"),
    ("#C3B2DE", NAVE,  False, "chappell: small print on the bare nave"),
    ("#C3B2DE", "#4E2E60", False, "chappell: small print under the rose window"),
    ("#C3B2DE", NICHE, False, "chappell: the niche note and its credit line"),
    (CREAM,     NICHE, False, "chappell: track titles in the arches"),
    (LEAF,      NICHE, True,  "chappell: the votive banner's heading"),
    (LEAF,      GLASS, False, "chappell: PRESS PLAY on the facade, and the room rule heading"),
    (CREAM,     GLASS, False, "chappell: the facade's own label and runtime"),
    (NAVE,      LEAF,  False, "chappell: the THE CHAPPELL nameplate, dark on gold leaf"),

    # THE SHARE CARDS (tools/make-og.py). Each card is its room's own markup on
    # its room's own ground, so most of what they draw is already above. These
    # are the pairs the cards ADDED -- and the two that the rooms had all along
    # and this file had never named, because a pair only gets checked once
    # somebody writes down where the text sits.
    (CYAN,      INK,  False, "plain rooms: h2 — and the plain share card's kicker"),
    ("#ffffff", "#047A9C", True, "quantum: the fringe caption, over the cyan "
     "interference stripe — the darkest of the three grounds those stripes make"),
    ("#b9b5c9", "#35224C", False, "enid: share-card footer over the violet half of the glow"),
    ("#b9b5c9", "#133523", False, "enid: share-card footer over the green half of the glow"),
    ("#2b0a1c", "#FF5AA6", False, "pony: dark copy over the brightest ray of the mirrorball glow"),

    # THE CAMPGROUNDS (love.css §13). Cold dusk, bone signs, one moon. Note that
    # Alfa Slab One is a 400-weight face however heavy it looks, so WCAG holds
    # its 19px headings to 4.5 and not to 3 -- the rule goes by the declared
    # weight, not by how black the design reads.
    (BONE,   DUSK,   True,  "campgrounds: h1 in Alfa Slab One, 38-72px"),
    (BONE,   DUSK,   False, "campgrounds: pitch names, 26px — checked at the body threshold too"),
    (LICHEN, DUSK,   False, "campgrounds: the lede, pitch copy, the open-pitch names"),
    (MOSS,   DUSK,   False, "campgrounds: h2, the pitch numbers, the trailmark, the who-line"),
    (MOON,   DUSK,   False, "campgrounds: links and the backlink"),
    (LICHEN, SPRUCE, False, "campgrounds: the board's notices"),
    (MOSS,   SPRUCE, False, "campgrounds: the board's list markers"),
    (MOON,   SPRUCE, False, "campgrounds: a link inside the board"),
    (BONE,   SPRUCE, False, "campgrounds: the stream's upper bank, if type ever lands on it"),

    # THE TWO PITCH DRAWINGS on the board. WCAG 1.4.3 does not reach a picture,
    # and the canopy in the Jungle Room is why these are here anyway: that
    # drawing measured 2.18 against the ground behind it, which is a smudge with
    # no telling one leaf from another, and nothing was looking. A sign nobody
    # can read is not a sign.
    #
    # EVERY LINE IN BOTH DRAWINGS IS MOSS, and the hierarchy is carried by
    # STROKE WEIGHT rather than by tint, precisely so there is one ink to check
    # instead of a ladder of dimmer greens that each need arguing about. The
    # masses under them are spruce and bark, which contrast with nothing on
    # purpose: these objects are carried by their OUTLINE and not by their fill,
    # which is the pebbling cabinet's reading of 1.4.11 arriving on a field.
    (MOSS,   DUSK,   False, "campgrounds: every line in both pitch drawings, on open ground"),
    (MOSS,   SPRUCE, False, "campgrounds: the same lines where they cross the ground band"),
    # And the one lit colour each, which is the only thing telling the two signs
    # apart. Held at the body threshold rather than the 3:1 graphics one for the
    # same reason the otter you steer is: the light is the subject of the
    # drawing, not decoration on it.
    (CANDLE, DUSK,   False, "campgrounds: the yurt sign's crown, doorway and fairy lights"),
    (CANDLE, SPRUCE, False, "campgrounds: the same, against the tent's own mass"),
    (EMBER2, DUSK,   False, "campgrounds: the warmer bulbs on the yurt sign's swag"),
    (MOON,   SPRUCE, False, "campgrounds: the moon on the hermitage sign's solar panels"),
    (SUNFLOWER, DUSK, False, "campgrounds: the hermitage sign's three sunflower heads"),
    (SPRUCE, SUNFLOWER, False, "campgrounds: the dark disc inside each sunflower"),
    (SCREEN, DUSK,  False, "campgrounds: the hermitage's one lit window, which is a screen"),
    (SPRUCE, SCREEN, False, "campgrounds: the window's glazing bars, dark on that screen"),

    # THE SOLARPUNK HERMITAGE (love.css §19). Outside first: daylight, where the
    # failure mode is a pale ink rather than a dim one.
    (FURROW,  NOON,   True,  "hermitage: h1 in Fraunces 700, 40-78px"),
    (FURROW,  NOON,   False, "hermitage: h2 and h3, checked at the body threshold too"),
    (FURROW2, NOON,   False, "hermitage: the lede and all body copy"),
    (SPROUT2, NOON,   False, "hermitage: links, the backlink, the trailmark"),
    (FURROW,  NOON2,  False, "hermitage: the space cards' and the bean bags' headings"),
    (FURROW2, NOON2,  False, "hermitage: the copy inside a space card or a bean bag"),
    (SPROUT2, NOON2,  False, "hermitage: the channel line on a documentary"),
    (FURROW,  SKY_H,  False, "hermitage: anything landing on the darkest end of the sky band"),
    (FURROW,  SKY_2,  False, "hermitage: the same, at the pale end where it meets the ground"),
    (SPROUT2, SKY_H,  False, "hermitage: the backlink and trailmark, which sit ON the sky"),
    (NOON,    CELL,   False, "hermitage: the play label on the screen plate"),
    (NOON,    "#17414E", False, "hermitage: the same, on the plate under the pointer"),
    (FURROW,  NOON,   False, "hermitage: the door-out's label on its pale ground"),
    (SPROUT,  NOON,   True,  "hermitage: the dashed ring around a door out, and every card border"),
    # The drawing. WCAG does not reach it and the canopy is why it is measured:
    # a cabin nobody can pick out of the sky is not a cabin. Held at the 3:1
    # graphics bar against every ground it is drawn on.
    (FURROW,  TIMBER_H, True, "hermitage: the outline around every part of the cabin, on its timber"),
    (TIMBER_H, NOON,  True,  "hermitage: the cabin's timber against the page"),
    (MEADOW,  NOON,   True,  "hermitage: the ground band the cabin stands on"),
    (MEADOW_LINE, MEADOW, True, "hermitage: the leaves, stems and grass drawn on that band"),
    (CELL,    SKY_H,  True,  "hermitage: the solar panels against the sky behind them"),
    (BLOOM,   NOON,   True,  "hermitage: the sunflower heads on the page ground"),
    (FURROW,  SKY_H,  True,  "hermitage: the window glass and the panels, outlined"),
    # Then the cave, which is dark-on-light inverted again -- back to cream on a
    # deep ground, and held against the composite the even light makes as well as
    # against the flat velvet, because the flat colour is not what anything is on.
    (WICK,    VELVET, False, "cave: the body copy and every heading"),
    (WICK,    VELVET_LIT, False, "cave: the same, on what the even light makes of that ground"),
    (WICK2,   VELVET, False, "cave: the author line, the cited-on line, the laptop note"),
    (WICK2,   VELVET_LIT, False, "cave: the same, on the lit ground"),
    (GILT,    VELVET, False, "cave: every link, and the open/close on a spine"),
    (GILT,    VELVET_LIT, False, "cave: the same, on the lit ground"),
    (WICK,    VELVET2, False, "cave: a book's title where it sits on the shelf panel"),
    (WICK2,   VELVET2, False, "cave: a book's author on the same panel"),
    (GILT,    VELVET2, False, "cave: a book's links, opened"),
    (WICK,    VELVET3, False, "cave: anything on the inner rule and the laptop's bezel"),
    (GILT,    VELVET3, False, "cave: the laptop's frame against the velvet behind it"),
    (WICK,    "#0B1418", False, "cave: the laptop's own label on the sleeping screen"),
    (GILT,    "#0B1418", False, "cave: the wake-the-laptop heading on it"),
    (WICK2,   "#0B1418", False, "cave: the sentence under it"),

    # The watering hole's three benches. Dark on light again, and the new ground
    # is NOON on NOON2 -- a sheet or a Star Stuff card laid on a worktop, which
    # is the lighter thing on the darker one, the opposite way round from every
    # card on this street.
    (FURROW,  NOON2,  True,  "workshop: the table headings, 24px"),
    (FURROW2, NOON2,  False, "workshop: what each table is, and the lay-out copy"),
    (SPROUT2, NOON2,  False, "workshop: links in a table's own description"),
    (CEDAR,   NOON2,  True,  "workshop: the worktop's front lip and the rules between items"),
    (FURROW,  NOON,   False, "workshop: a specimen name and a Star Stuff title on the sheet itself"),
    (FURROW2, NOON,   False, "workshop: what a sheet is pressed as, and the note inside it"),
    (SPROUT2, NOON,   False, "workshop: a Star Stuff link, and a borrow link on the bench"),
    (SPROUT,  NOON,   True,  "workshop: the green edge down a Star Stuff card"),

    # THE CAMPFIRE'S SCENE. The outline first, because it is what carries every
    # object in it and therefore the only thing that has to pass twice.
    (FURROW,  TURF,   True,  "campfire: the outline round every object, against the rug"),
    (FURROW,  BAG1,   True,  "campfire: the same outline, against the tangerine chair"),
    (FURROW,  BAG2,   True,  "campfire: against the magenta chair"),
    (FURROW,  BAG3,   True,  "campfire: against the teal chair"),
    (FURROW,  CEDAR,  True,  "campfire: against the coffee table and its legs"),
    (TURF,    NOON,   True,  "campfire: the rug itself, against the page ground"),
    (BAKELITE, TURF,  True,  "campfire: the television, which carries itself and takes no outline"),
    # Then the words. The chairs are the only bright grounds on this street that
    # carry body copy, and they are read DARK, like the rest of this room.
    (FURROW,  BAG1,   False, "campfire: everything written on the tangerine chair"),
    (FURROW,  BAG2,   False, "campfire: everything written on the magenta chair"),
    (FURROW,  BAG3,   False, "campfire: everything written on the teal chair"),
    (FURROW,  NOON,   False, "campfire: the remote's buttons and the slip of paper beside them"),
    (FURROW2, NOON,   False, "campfire: the note under the rug"),
    # And the screen, which is the only genuinely black thing in a daylit cabin.
    (TELLY_LIT, TELLY_OFF, True,  "campfire: the channel name on the dark screen, 17-23px"),
    (TELLY_LIT, TELLY_OFF, False, "campfire: the same, checked at the body threshold too"),
    (TELLY_DIM, TELLY_OFF, False, "campfire: THE SET IS OFF, and the runtime under the name"),
    (TELLY_LIT, BAKELITE, True,  "campfire: the play button's ring where it meets the casing"),
    (TELLY_OFF, TELLY_LIT, False, "campfire: the play button inverted, under the pointer"),
    (BAKELITE_2, BAKELITE, True, "campfire: the brand strip on the set's casing"),

    # THE THIRTEEN COLOURS THIS FILE HAD NEVER SEEN, resolved. Five were a dead
    # palette and are deleted; these are the ones that turned out to be real.
    #
    # The Faery Yurt's ivy is the clearest case for measuring decoration at all:
    # Helen's own copy says the ivy came in through the window frame and was
    # never asked to leave, so it is a thing the room asks you to look at. The
    # page draws it with these hexes inline, the way her crown is drawn, which
    # is why nothing here had ever named them.
    (IVY, HEARTH, True, "yurt: the vines, against the tent ground"),
    (IVY, TENT,   True, "yurt: the vines, against the canvas"),
    (IVY, CANVAS, True, "yurt: the vines, against a canvas panel"),
    (IVY, GLOW,   True, "yurt: the vines, under the ember crown's glow"),
    # The START button's hover ground on the pebbling shore, which is the one of
    # the thirteen that turned out to carry TEXT -- the button says START and
    # (no coin slot here either) -- and was the one nobody would have guessed,
    # because its name said sea glass.
    (SKY, PEB_PRESS, False, "shore: START on the coin, on its pressed ground"),

    # CLUB CHRONIC (love.css §20). The wall first.
    (PASTE,     BRICK,     True,  "club: h1 in Anton, 46-122px, and every heading"),
    (PASTE,     BRICK,     False, "club: the same, checked at the body threshold too"),
    (PASTE_2,   BRICK,     False, "club: the lede, the rack intros, the deck copy"),
    (NEWSPRINT, BRICK,     False, "club: the awning's sub-line and every artist line"),
    (MARKER,    BRICK,     False, "club: links, the trailmark, and the sharpie on the wall"),
    (SIREN,     BRICK,     False, "club: FREAKS TO THE FRONT, and the rack numbers"),
    (PASTE,     BRICK_2,   False, "club: a sleeve's title and a deck's, on the darker panel"),
    (PASTE_2,   BRICK_2,   False, "club: a sleeve's note"),
    (NEWSPRINT, BRICK_2,   False, "club: a sleeve's artist line"),
    (MARKER,    BRICK_2,   False, "club: the role scrawled on a sleeve, and the policy's rule"),
    (PASTE,     STAGE_LIT, False, "club: anything sitting in the bulb's wash near the stage"),
    (MARKER,    STAGE_LIT, False, "club: the same, in marker"),
    (SIREN,     STAGE_LIT, False, "club: the same, in red"),
    (PASTE,     BOOTBLACK, False, "club: the awning's name, and a facade's label"),
    (MARKER,    BOOTBLACK, True,  "club: the ring round every facade in this room"),
    # THEN THE PAPER, which is the half that behaves oppositely -- and where the
    # one colour that must never go is the red: --siren measures 2.91 on flyer
    # stock and 2.22 on the darker stock, so it stays on the wall. It is the
    # brightest thing in the room and it is the one thing the paper cannot hold.
    (BOOTBLACK, PASTE,     True,  "club: a flyer's heading, 19px"),
    (BOOTBLACK, PASTE,     False, "club: the same at the body threshold"),
    (BRICK,     PASTE,     False, "club: a flyer's description and its GO link"),
    (GRIME,     PASTE,     False, "club: the service a flyer points at"),
    (BOOTBLACK, PASTE_2,   False, "club: the same, on the darker flyer stock"),
    (BRICK,     PASTE_2,   False, "club: a description on that stock"),
    (GRIME,     PASTE_2,   False, "club: the service line on that stock"),
    (STAPLE,    PASTE,     True,  "club: the staples holding a flyer to the wall"),
    (STAPLE,    PASTE_2,   True,  "club: the same, on the darker stock"),
    (PASTE,     GRIME,     True,  "club: the awning's drop shadow against the wall behind it"),
    # The press-to-play plate's HOVER ground, which is shared furniture used in
    # every room that has a facade and had never been measured in any of them.
    (CREAM, INK3, False, "street: a facade's own text, on its hover ground"),
    (CHALK, INK3, False, "street: the dimmer text on the same"),
    # And the yurt's ember, which draws the animals' faces and the mug on
    # Helen's page. Hardcoded there like her ivy, so nothing here had named it.
    (EMBER, HEARTH, True, "yurt: the animals' faces and the mug, on the tent ground"),
    (EMBER, TENT,   True, "yurt: the same, on the canvas"),
    (EMBER, CANVAS, True, "yurt: the same, on a canvas panel"),
    (EMBER, GLOW,   True, "yurt: the same, under the ember crown's glow"),
    (CEDAR,   NOON,   True,  "workshop: the hairline around a pressed sheet"),
    (INK,    GREEN,  False, "street: the signpost arm, dark on painted green"),
    (INK,    CYAN,   False, "street: the signpost arm on hover"),

    # THE FAERY YURT (love.css §14). Helen's palette, checked against all four
    # of her grounds AND against GLOW, which is what her canvas weave and ember
    # crown composite to. That last column is the one that matters: it is how
    # #8a7462 was caught, which she had on the eyebrow, the shelf note, the
    # window hint, the pet cards and the footer -- 4.30 on the flat hearth,
    # 3.43 over the crown, 3.61 on a card. It is #A4907B here and clears all of
    # them. It is the only value of hers this site changed.
    (TALLOW,  HEARTH,  True,  "yurt: h1, 42-67px Cormorant Garamond italic"),
    (TALLOW,  HEARTH,  False, "yurt: body copy in Crimson Pro"),
    (TALLOW,  GLOW,    False, "yurt: body copy under the ember crown"),
    (TALLOW2, HEARTH,  False, "yurt: the tagline, section intros, the photo caption"),
    (TALLOW2, GLOW,    False, "yurt: the tagline under the crown"),
    (TALLOW2, CANVAS,  False, "yurt: the record's copy and the nook's labels"),
    (TALLOW2, CANVAS_2, False, "yurt: copy on the darker half of a card gradient"),
    (TALLOW3, HEARTH,  False, "yurt: eyebrow, shelf note, window hint, colophon"),
    (TALLOW3, GLOW,    False, "yurt: the eyebrow under the crown — the tightest pair in the room"),
    (TALLOW3, CANVAS,  False, "yurt: the resident cards' copy"),
    (TALLOW3, CANVAS_2, False, "yurt: the resident cards' copy at the foot of the gradient"),
    (EMBER2,  HEARTH,  False, "yurt: links"),
    (EMBER2,  GLOW,    False, "yurt: links under the crown"),
    (EMBER2,  CANVAS,  False, "yurt: the 'coming soon' pill on the record"),
    (CANDLE,  HEARTH,  False, "yurt: a link on hover"),
    (TALLOW,  TENT,    False, "yurt: copy on the dark end of a card gradient"),
    (TALLOW2, CANVAS,  False, "yurt: the cupcake tile's label, which is a button"),
    (TALLOW3, CANVAS_2, False, "yurt: the sound marker on that button, hover"),
    (TALLOW3, CANVAS,  False, "yurt: the sound marker at Gentle, where it is always shown"),
    (EMBER2,  CANVAS_2, False, "yurt: the sound marker while it is playing"),

    # The twelve book spines are six 90deg gradients, so each one is TWO grounds
    # and the lighter end is the one that decides. Helen's fourth spine ran to
    # #9a6c2f, where her cream measured 3.74 at 16px; it stops at #8A5F26 now.
    (TALLOW, "#6E2F2B", False, "yurt: spine c1, dark end"),
    (TALLOW, "#8A3D34", False, "yurt: spine c1, light end"),
    (TALLOW, "#38491F", False, "yurt: spine c2, dark end"),
    (TALLOW, "#4A5F2A", False, "yurt: spine c2, light end"),
    (TALLOW, "#5A3D63", False, "yurt: spine c3, dark end"),
    (TALLOW, "#75507F", False, "yurt: spine c3, light end"),
    (TALLOW, "#7A5324", False, "yurt: spine c4, dark end"),
    (TALLOW, "#8A5F26", False, "yurt: spine c4, light end — was #9a6c2f and failed at 3.74"),
    (TALLOW, "#29414A", False, "yurt: spine c5, dark end"),
    (TALLOW, "#375968", False, "yurt: spine c5, light end"),
    (TALLOW, "#4A2F4F", False, "yurt: spine c6, dark end"),
    (TALLOW, "#653D6B", False, "yurt: spine c6, light end"),
    # THE ARCADE (love.css §15). Room seven, and the first one lit by a screen.
    # Three grounds the room declares and two it composites, and every ink is
    # held against the composite as well as the flat colour, because the flat
    # colour is never what the type is on.
    (COIN,  CARPET, True,  "arcade: h1 in Press Start 2P, 21-52px"),
    (COIN,  SPILL,  True,  "arcade: h1 under the cabinet's own glow"),
    (TUBE,  CARPET, False, "arcade: the lede and every paragraph on the carpet"),
    (TUBE,  SPILL,  False, "arcade: the lede under the glow"),
    (MINT,  CARPET, False, "arcade: links, and the h3s in the plates"),
    (MINT,  SPILL,  False, "arcade: a link under the glow"),
    (TUBE2, CARPET, False, "arcade: the eyebrow and the cabinet's sub-line"),
    (TUBE2, SPILL,  False, "arcade: the eyebrow under the glow — the tightest pair in the room"),
    (ZAP,   CARPET, False, "arcade: h2 in the plates, 14px"),
    (TUBE,  CAB,    False, "arcade: plate body copy and the knob labels"),
    (TUBE2, CAB,    False, "arcade: the speed legend, 10px"),
    (ZAP,   CAB,    False, "arcade: the plates' headings"),
    (MINT,  CAB,    False, "arcade: links inside a plate, and the pad's arrows"),
    (COIN,  CAB,    False, "arcade: the mane count"),
    (MINT,  CRT,    False, "arcade: the screen's live region, 11px"),
    (MINT,  CRT_LIT, False, "arcade: the live region where a scanline lands under it"),
    (TUBE,  CRT_LIT, False, "arcade: the attract screen's copy on the lit stripe"),
    (COIN,  CRT_LIT, True,  "arcade: anything gold drawn on the playfield"),
    (CARPET, COIN,  True,  "arcade: INSERT COIN, dark on gold; and the cabinet marquee"),
    (CRT,   MINT,   False, "arcade: a pad arrow or a speed knob while it is pressed"),
    (CARPET, MINT,  False, "arcade: the take-your-Esmx plate's border and its dark type"),
    (CARPET, ZAP,   False, "arcade: SHAKE OUT THE MANE, dark on magenta"),

    # The eight quills, on both grounds the scanlines make. These are GRAPHICS
    # and WCAG 1.4.3 does not reach them -- 1.4.11 does, at 3:1, because a quill
    # you cannot pick out of the background is a control you cannot use. They are
    # held to 4.5 here anyway: every one of them clears it, so there is no reason
    # to write down a lower bar and later forget which one applied. Each also has
    # a NAME, said out loud on contact, so colour is never the only channel.
    ("#FF5A4E", CRT_LIT, False, "arcade: the coral quill"),
    ("#FF9B2F", CRT_LIT, False, "arcade: the tangerine quill"),
    ("#FFD93D", CRT_LIT, False, "arcade: the gold quill"),
    ("#5CE86B", CRT_LIT, False, "arcade: the lime quill"),
    ("#4BF0C6", CRT_LIT, False, "arcade: the mint quill"),
    ("#49D8FF", CRT_LIT, False, "arcade: the sky quill"),
    ("#B98BFF", CRT_LIT, False, "arcade: the violet quill"),
    ("#FF7AC8", CRT_LIT, False, "arcade: the rose quill"),
    ("#F26FA8", CRT_LIT, False, "arcade: Esmx's own pink, against the screen"),
    ("#6BD98F", CRT_LIT, False, "arcade: Esmx's snout and belly green"),
    # THE BAY (love.css §15, cabinet two). Everything is held against SHOAL_LIT,
    # the lightest of the four grounds this screen makes, as well as against the
    # flat colours. --pelt is the otter you steer, and it is held to the BODY
    # threshold rather than the 3:1 one that graphics get: a thing the player
    # drives is not decoration, and the first draft's #BE7F52 measured 2.72 on
    # the lit shoal, which is under even the graphics bar.
    (MINT,     BAY,       False, "bay: the live region under the screen"),
    (MINT,     SHOAL_LIT, False, "bay: anything mint drawn on the lit shoal"),
    (TUBE,     SHOAL_LIT, False, "bay: the attract screen's copy"),
    (TUBE2,    SHOAL_LIT, False, "bay: the attract screen's small print"),
    (COIN,     SHOAL_LIT, True,  "bay: anything gold on the water"),
    (PELT,     BAY_LIT,   False, "bay: the otter you steer, on the deep"),
    (PELT,     SHOAL_LIT, False, "bay: the otter you steer, on the lit shoal"),
    (WHISKERS, BAY_LIT,   False, "bay: the otter's muzzle, belly and paws"),
    (WHISKERS, SHOAL_LIT, False, "bay: the otter's muzzle on the lit shoal"),
    (KELP,     BAY_LIT,   False, "bay: the kelp stipes, which are also where you stay put"),
    (KELP,     SHOAL_LIT, False, "bay: kelp at the surface"),
    (KELP2,    BAY_LIT,   False, "bay: the kelp blades and the waterline"),
    (KELP2,    SHOAL_LIT, False, "bay: the waterline against the shoal"),
    (FISHY,    BAY_LIT,   False, "bay: a fish at feeding time"),
    (FISHY,    SHOAL_LIT, False, "bay: a fish near the surface"),
    (COBBLE,   BAY_LIT,   False, "bay: a stone on the bed, and the one on the otter's chest"),
    (SHELLY,   BAY_LIT,   False, "bay: the clam"),
    (URCHIN,   BAY_LIT,   False, "bay: the urchin"),
    (COBBLE,   BAY,       False, "bay: the seabed's edge against the water — the bed's own\n     fill measured 1.10 there, so the boundary is carried by this line instead"),
    (COBBLE,   "#04161D", False, "bay: the seabed's edge against the bed below it"),
    # THE SHORE (love.css §15, the pebbling cabinet). The outline against each
    # ground, then each fill against the outline. Nothing here is checked fill
    # against ground, and the reason is written above: on a pale beach that
    # measurement answers the wrong question.
    (PEN_DARK, SKY,     False, "shore: every outline against the sky, and the attract copy"),
    (PEN_DARK, SEA,     False, "shore: every outline against the band of sea"),
    (PEN_DARK, SHINGLE, False, "shore: every outline against the shingle — where the pebbles are"),
    (PEN_LIGHT, PEN_DARK, False, "shore: the penguin's front, inside its outline"),
    (BEAK,      PEN_DARK, False, "shore: beak and feet, inside the outline"),
    (PEB_GREY,  PEN_DARK, False, "shore: the smooth grey pebble"),
    (PEB_WHITE, PEN_DARK, False, "shore: the pale round pebble"),
    (PEB_GLASS, PEN_DARK, False, "shore: the piece of sea glass"),
    (PEB_SPECK, PEN_DARK, False, "shore: the speckled stone"),
    (PEB_FEATHER, PEN_DARK, False, "shore: the feather — the tightest fill in this cabinet"),
    (PEB_SHELL, PEN_DARK, False, "shore: the broken shell"),
    (NEST,      PEN_DARK, False, "shore: a nest"),
    (SKY,       PEN_DARK, False, "shore: START, pale on the dark plate — this screen inverts the coin"),

    # THE LATIBULUM (love.css §16). THE ONLY ROOM ON THE STREET THAT READS DARK
    # ON LIGHT FOR MOST OF ITS WORDS, which is the structural thing keeping a
    # warm brown burrow from being a second Faery Yurt -- so it has two sets of
    # pairs rather than one. On the earth: oat and lamp against the loam and
    # against the lamp pool it composites to. On the wall: umber against both
    # ends of the plaster gradient and both ends of a shelf tile on top of it.
    #
    # THE LINK COLOUR WAS DECIDED HERE RATHER THAN BY EYE. The door's own green,
    # #3C6B4C, measured 4.41 on the plaster and 3.66 where the lamp does not
    # reach -- a room whose links were the colour of its front door, failing on
    # the ground it spends the most words on. It is #2F5A3C now, which clears
    # both, and the door stays the lighter green because a door is a graphic.
    (OAT,     LOAM,      False, "latibulum: body copy on the earth"),
    (OAT,     LAMPLIT,   False, "latibulum: body copy inside the lamp pool"),
    (OAT,     BURROW,    False, "latibulum: copy on the hollow behind the round door"),
    (OAT_2,   LOAM,      False, "latibulum: the eyebrow, the lede, the scrawl, the trail line"),
    (OAT_2,   LAMPLIT,   False, "latibulum: the lede under the lamp — the tightest pair on the earth"),
    (LAMP,    LOAM,      False, "latibulum: every link on the earth, and the tagline"),
    (LAMP,    LAMPLIT,   False, "latibulum: a link under the lamp"),
    (LAMP,    BURROW,    False, "latibulum: the rule markers down the left of the house rules"),
    (UMBER,   PLASTER,   False, "latibulum: body copy on the lit wall"),
    (UMBER,   PLASTER_2, False, "latibulum: body copy where the wall falls into shadow"),
    (UMBER,   TILE,      False, "latibulum: a shelf tile's name, on the lit end of the wall"),
    (UMBER,   TILE_2,    False, "latibulum: a shelf tile's name, on the shaded end"),
    (UMBER_2, PLASTER,   False, "latibulum: the small print on the wall, and the RUNS line"),
    (UMBER_2, PLASTER_2, False, "latibulum: the same, in the shadow"),
    (UMBER_2, TILE,      False, "latibulum: a shelf tile's line of copy"),
    (UMBER_2, TILE_2,    False, "latibulum: a shelf tile's copy on the shaded end — and its icon,\n     which is a graphic held to the body threshold because a suggestion you\n     cannot make out is a suggestion that is not being offered"),
    (DOOR_G,  PLASTER,   False, "latibulum: a link on the wall"),
    (DOOR_G,  PLASTER_2, False, "latibulum: a link on the shaded wall"),
    (DOOR_G,  TILE,      False, "latibulum: a link inside a shelf tile"),
    (DOOR_G,  TILE_2,    False, "latibulum: a link inside a shelf tile, shaded"),
    (RUST,    PLASTER,   False, "latibulum: a link on the wall while you are on it"),
    (RUST,    PLASTER_2, False, "latibulum: the same, shaded"),
    (OAT,     RECESS,    False, "latibulum: the label inside the wireless and the television"),
    (LAMP,    RECESS,    False, "latibulum: TURN IT ON, SWITCH IT ON"),
    (OAT,     BEAM,      False, "latibulum: anything set on the bare wood of a case"),
    (PLASTER, DOOR_G,    False, "latibulum: the round door's planking against its own green"),
    #
    # THE BRASS IS HELD TO 3:1 AND THE REST OF THE CABINET IS NOT, on purpose.
    # A knob, a doorknob and an aerial are the parts somebody has to pick out of
    # a drawing, so they get the graphics bar -- and the first brass, #C28F3C,
    # measured 1.93 against the lightest of the three woods behind it. It is
    # #E3BB6A now and clears all three. The case, the grille cloth and the
    # recess around the screen are NOT listed: they are decoration around a
    # control that identifies itself, because the thing you press is a <button>
    # with its own border and its own label, and that label is measured above.
    (BRASS,   WOOD_1,    True,  "latibulum: a knob on the lightest of the case's three woods"),
    (BRASS,   BEAM,      True,  "latibulum: a knob on the middle of the case"),
    (BRASS,   WOOD_3,    True,  "latibulum: a knob at the dark foot of the case"),
    (BRASS,   DOOR_G,    True,  "latibulum: the doorknob, in the middle of the round door"),
    (BRASS,   LOAM,      True,  "latibulum: the television's aerial, against the earth"),
    (SCALE,   WOOD_1,    True,  "latibulum: the tuning strip against the wood it is set into"),
    (RUST,    PLASTER_2, True,  "latibulum: the needle on the tuning strip"),
    #
    # THE JUNGLE ROOM (love.css §17). EVERY INK IS HELD AGAINST THE LIGHT AS
    # WELL AS AGAINST THE DARK, which in this room is not a formality: the
    # shafts are the reason the place looks like a rainforest, they land
    # wherever they land, and a word that only clears on the unlit ground is a
    # word somebody reads in the one spot where it fails.
    (DAYLIGHT,  CANOPY,     False, "jungle: body copy on the forest floor"),
    (DAYLIGHT,  SHAFT,      False, "jungle: body copy inside a shaft of light"),
    (DAYLIGHT,  UNDERSTORY, False, "jungle: a cam's note, and every word on a buttress panel"),
    (DAYLIGHT,  SHAFT_2,    False, "jungle: the same, with the light on it"),
    (DAYLIGHT,  APERTURE,   False, "jungle: the label inside an unopened screen"),
    (SAP,       CANOPY,     False, "jungle: the lede, the trail line, the credits"),
    (SAP,       SHAFT,      False, "jungle: the lede under the light — the tightest pair on the floor"),
    (SAP,       UNDERSTORY, False, "jungle: whose camera it is, under each cam's note"),
    (SAP,       SHAFT_2,    False, "jungle: the same, lit"),
    (SUN,       CANOPY,     False, "jungle: LIVE, and the gallery headings"),
    (SUN,       SHAFT,      False, "jungle: LIVE with the light on it"),
    (SUN,       UNDERSTORY, False, "jungle: LIVE on a cam, and OPEN THE LEAVES on a screen"),
    (SUN,       SHAFT_2,    False, "jungle: the same, lit"),
    (SUN,       APERTURE,   False, "jungle: OPEN THE LEAVES, inside the dark of the screen"),
    (SAP,       APERTURE,   False, "jungle: why a cam opens off site, inside its own dark"),
    (SUN,       LITTER,     False, "jungle: anything set on the leaf litter at the foot"),
    (HELICONIA, CANOPY,     False, "jungle: every link on the forest floor, and the tagline"),
    (HELICONIA, SHAFT,      False, "jungle: a link under the light"),
    (HELICONIA, UNDERSTORY, False, "jungle: a link inside a buttress panel or a cam"),
    (HELICONIA, SHAFT_2,    False, "jungle: the same, lit"),
    (ORCHID,    CANOPY,     False, "jungle: the eyebrow over the room's name"),
    (ORCHID,    SHAFT,      False, "jungle: the eyebrow, which sits directly under the canopy's own opening"),
    #
    # THE FOUR GRAPHICS, at the 3:1 bar. The dot beside LIVE and the leaf on a
    # gallery heading are the two things here that are drawn rather than
    # written, and both are carrying meaning -- the dot says the thing does not
    # end and the leaf says a new group has started -- so neither is allowed to
    # be a smudge. Neither is the ONLY channel for what it says: the word LIVE
    # is beside the dot and the group's name is beside the leaf, because colour
    # and shape are never the only channel on this street.
    (HELICONIA, UNDERSTORY, True,  "jungle: the dot beside the word LIVE"),
    (PALM,      CANOPY,     True,  "jungle: the leaf on a gallery heading, and a house-rule marker"),
    (PALM,      SHAFT,      True,  "jungle: the same leaf with the light on it"),
    (PALM,      UNDERSTORY, True,  "jungle: a house-rule marker, inside a buttress panel"),
    (PALM,      SHAFT_2,    True,  "jungle: the same marker with the light on it"),
    (PALM,      APERTURE,   True,  "jungle: the dashed border round a cam that opens off site"),
    (CANOPY_LEAF, CANOPY,   True,  "jungle: the lightest leaf in the canopy band, against the sky behind it"),
    #
    # THE DEN (love.css §18). Two grounds that have nothing to do with each
    # other: the panelled wall, which is where the room talks, and the carpet,
    # which is where the records are. Every ink on the wall is held against the
    # lamp pool as well as against the flat panelling, the same rule the burrow
    # and the chapel are held to.
    (COCONUT, PANEL,       False, "den: body copy on the panelling"),
    (COCONUT, LAMPLIT_DEN, False, "den: body copy inside the lamp pool"),
    (COCONUT, TEAK,        False, "den: anything set on the bare wood of a frame"),
    (RATTAN,  PANEL,       False, "den: the lede, the trail line, the credits"),
    (RATTAN,  LAMPLIT_DEN, False, "den: the lede under the lamp — the tightest pair on the wall"),
    (TIKI,    PANEL,       False, "den: every link on the panelling, and the session headings"),
    (TIKI,    LAMPLIT_DEN, False, "den: a link under the lamp"),
    (TIKI,    TEAK,        False, "den: DROP THE NEEDLE, on the console top"),
    (JADE,    PANEL,       False, "den: the eyebrow over the room's name"),
    (JADE,    LAMPLIT_DEN, False, "den: the same, lit"),
    (RUM,     PANEL,       False, "den: the tagline"),
    (RUM,     LAMPLIT_DEN, False, "den: the tagline where the lamp reaches it"),
    #
    # AND THE CARPET, which is the inversion. Nothing else on this street sets
    # dark type on a saturated green, and the gradient means there are two of
    # it — the DARKER end decides, the same way the burrow's plaster works and
    # the opposite of everywhere else here.
    (COCOA,   SHAG,        False, "den: a session heading, set straight onto the carpet"),
    (COCOA,   SHAG_2,      False, "den: the same at the shaded end of the carpet"),
    (COCOA_2, SHAG,        False, "den: the session dates and the line under them, on the carpet"),
    (COCOA_2, SHAG_2,      False, "den: the same, shaded — the tightest pair on the green"),
    (COCOA,   CUT,         False, "den: a song title, on the pane laid over the carpet"),
    (COCOA,   CUT_2,       False, "den: the same, on the shaded end"),
    (COCOA_2, CUT,         False, "den: who wrote it, what night it was cut, how long it runs"),
    (COCOA_2, CUT_2,       False, "den: the same, shaded"),
    (TEAK,    CUT,         False, "den: the track number on a cut"),
    (TEAK,    CUT_2,       False, "den: the same, shaded"),
    (TEAK,    SHAG,        True,  "den: the frame around a cut, against the carpet behind it"),
    #
    # THE FOUR GRAPHICS, at the 3:1 bar. The carpet has to be tellable from the
    # panelling or the room has no floor; the fieldstone and the water are the
    # two halves of the drawing on the north wall; and the notch beside a house
    # rule is this room's bullet, carrying "a new one starts here" the way the
    # Jungle Room's leaf does.
    (SHAG,    PANEL,       True,  "den: the carpet against the panelling it is laid on"),
    (STONE,   PANEL,       True,  "den: the cut fieldstone of the waterfall wall"),
    (JADE,    "#2B1709",   True,  "den: the water falling down it"),
    (JADE,    PANEL,       True,  "den: the notch beside a house rule"),

    # THE PEBBLE BOARD (love.css §21). TWO PALETTES, AND THE SEAM IS THE OBJECT:
    # the street's night outside the glass and NORAH HOBBS'S PAPER inside it. Her
    # values arrived unmeasured by us and every one of them clears the body
    # threshold, which is worth writing down rather than quietly relying on --
    # the last design that came in from outside this repo had five labels on one
    # failing grey. Nothing reads directly on the cork; the cards are opaque, so
    # the cork is in ORNAMENT with its measurement.
    (PBINK,      PBCARD,       False, "board: every card's title, and the cover"),
    (PBINK,      PBPAPER,      False, "board: ink on the paper ground"),
    (PBINK,      PBPAPER_DEEP, False, "board: ink on the deeper paper"),
    (PBSOFT,     PBCARD,       False, "board: credits, notes and the read-more summaries"),
    (PBSOFT,     PBPAPER,      False, "board: the same on paper"),
    (PBSOFT,     PBPAPER_DEEP, False, "board: the same on the deeper paper"),
    # 4.41, AND LEFT AS NORAH SET IT. The cover slug is 18px Gloria Hallelujah,
    # which is large text by WCAG and wants 3:1; it clears that by half again.
    # Nudging it darker to win the body threshold would be tidying a
    # contributor's design for a bar it was never held to -- the opposite of the
    # one colour of Helen's this repo did change, which failed outright at 4.30
    # and below on three grounds with body copy on them.
    (PBGOLD,     PBGOLD_BG,    True,  "board: the cover slug, 18px — 4.41, large-text bar"),
    (PBPLATE_INK, PBPLATE,     False, "board: the engraved plate on the frame"),
    (PBCHALK,    PBNIGHT,      False, "board: the backlink and the rack, on the street ground"),
    (PBCHALK,    PBFRAME,      False, "board: the same where the rack overlaps the frame"),
    (PBLAMP,     PBNIGHT,      False, "board: the rack's heading and its links"),
    (PBINK,      "#C9A6A0",    False, "board: the Songs tab on its tape"),
    (PBINK,      "#A9B18C",    False, "board: the Things We Read tab"),
    (PBINK,      "#D7B67E",    False, "board: the Art tab"),
    (PBINK,      "#E0C15A",    False, "board: the Just for Laughs tab"),
    (PBINK,      "#9FA8C0",    False, "board: the Moments tab"),
    (PBINK,      "#C68B5C",    False, "board: the Notes About Each Other tab"),
    (PBINK,      "#D4AF37",    False, "board: the Seen & Celebrated tab"),
    (PBPAPER,    PBCORK,       False, "board: the contents list, which is the one run of\n     type that sits straight on the cork rather than on a card"),
    # The memorial is the one dark thing on the paper and Norah set it that way.
    (PBMEM_INK,    PBMEM_CARD, False, "board: the Om Malik tribute's text"),
    (PBMEM_HEAD,   PBMEM_CARD, False, "board: his name"),
    (PBMEM_CREDIT, PBMEM_CARD, False, "board: who shared it and why"),
    (PBMEM_GOLD,   PBMEM_CARD, False, "board: the 'in memory' kicker"),
    (PBMEM_LINK,   PBMEM_CARD, False, "board: the link to the full tribute"),
    # The memorial's ground was in ORNAMENT as carrying no type of its own, and
    # then the lightbox put a Close button on it. Moved rather than left with a
    # note that had stopped being true -- that list is the record of what was
    # looked at, so a stale entry in it is worse than no entry.
    (PBMEM_INK,    PBMEM,      False, "board: the lightbox's Close button"),
    (PBMEM_CREDIT, PBMEM,      False, "board: its outline, at the body threshold because a\n     control you cannot find is a control that is not offered"),
    (PBMEM_INK,    PBMEM_CARD, False, "board: the lightbox's description, on the same ground"),
    # ── The Mopery (§22) ──────────────────────────────────────────────────
    (MOP_BONE, MOP_NIGHT, False, "mopery: body copy on the room"),
    (MOP_BONE, MOP_STONE, False, "mopery: body copy on a case panel, a poem box, a record"),
    (MOP_BONE, MOP_SHELF, False, "mopery: a note on the shelf board"),
    (MOP_BONE, MOP_DEEP,  False, "mopery: the screen surround and the manuscript door"),
    (MOP_DIM,  MOP_NIGHT, False, "mopery: the shop's eyebrow and the quiet lines"),
    (MOP_DIM,  MOP_STONE, False, "mopery: a shelf card's subtitle, a record's byline"),
    (MOP_DIM,  MOP_SHELF, False, "mopery: a runtime beside a cut"),
    (MOP_DIM,  MOP_DEEP,  False, "mopery: the parlour's small print"),
    (MOP_GILT, MOP_NIGHT, False, "mopery: links, the shop sign, every h2"),
    (MOP_GILT, MOP_STONE, False, "mopery: a shelf card, a record's title, the way-in headings"),
    (MOP_GILT, MOP_SHELF, False, "mopery: the selected cut's rule and label"),
    (MOP_GILT, MOP_DEEP,  False, "mopery: the play button and the door out"),
    (MOP_FLAME, MOP_NIGHT, False, "mopery: the shelf-talker where it sits on the room"),
    (MOP_FLAME, MOP_STONE, False, "mopery: the shelf-talker inside a record"),
    # NINE SPINES, EACH WITH THE INK IT ACTUALLY CARRIES. A spine is a coloured
    # block with a title set down it; there is no shared rule, so every one is
    # its own pair and make-mopery.py refuses a spine colour love.css has no
    # rule for -- an unstyled spine is invisible rather than wrong.
    (MOP_BONE, MOP_OXBLOOD,  False, "mopery: The Secret History's spine"),
    (MOP_DEEP, MOP_SUGAR,    False, "mopery: Bunny's spine"),
    (MOP_BONE, MOP_INKSPINE, False, "mopery: The Atlas Six's spine"),
    (MOP_BONE, MOP_GRAPHITE, False, "mopery: A Deadly Education's spine"),
    (MOP_BONE, MOP_TAR,      False, "mopery: Nocticadia's spine"),
    (MOP_BONE, MOP_WINE,     False, "mopery: Gothikana's spine"),
    (MOP_DEEP, MOP_VELLUM,   False, "mopery: A Discovery of Witches' spine"),
    (MOP_DEEP, MOP_DUST,     False, "mopery: The Historian's spine"),
    (MOP_BONE, MOP_MOSS,     False, "mopery: Dionysus in Wisconsin's spine"),

    # ── The Oracle Deck (§23) ─────────────────────────────────────────────
    (ORC_CUT,   ORC_SLATE, False, "oracle: a card's note and the page's body copy"),
    (ORC_CUT,   ORC_DEEP,  False, "oracle: the draw table's heading and its lede"),
    (ORC_DIM,   ORC_SLATE, False, "oracle: the plate's credit line under every card"),
    (ORC_DIM,   ORC_DEEP,  False, "oracle: the empty-slot line and the live region"),
    (ORC_RED,   ORC_SLATE, False, "oracle: the question on every card"),
    (ORC_RED,   ORC_DEEP,  False, "oracle: the question on a drawn card"),
    (ORC_BRASS, ORC_SLATE, False, "oracle: links in a plate's credit"),
    (ORC_BRASS, ORC_DEEP,  False, "oracle: the draw button and the put-it-back button"),

    # ── The Doomscroll (§24) ──────────────────────────────────────────────
    (DSC_INK,   DSC_PAPER,  False, "doomscroll: the masthead, every headline, every poem"),
    (DSC_INK,   DSC_PAPER2, False, "doomscroll: a headline over the shaded edge of the roll"),
    (DSC_INK2,  DSC_PAPER,  False, "doomscroll: the standfirst, the notes, the provenance"),
    (DSC_INK2,  DSC_PAPER2, False, "doomscroll: the same, at the curled edges"),
    (DSC_RED,   DSC_PAPER,  False, "doomscroll: the dateline over every item"),
    (DSC_RED,   DSC_PAPER2, False, "doomscroll: a dateline at the edge of the roll"),
    (DSC_PAPER, DSC_DESK,   False, "doomscroll: the backlinks and the footer, on the desk"),
    (DSC_BONE,  DSC_DESK,   False, "doomscroll: the dial's own copy, off the paper"),

    # ── Swaying Sweetgrass (§25) ──────────────────────────────────────────
    # THE LIGHT IS BEHIND THE GRASS, so this room's risk is the opposite of the
    # Hermitage's next door: everything is pale on a dark ground again, and the
    # thing to watch is the two GREENS, because a green that reads as a plant
    # from across the room is a green that stops reading as a word up close.
    # --sedge carries the small print and is measured as type; --stem carries
    # nothing and is in ORNAMENT with what it came out at, which is the Jungle
    # Room's canopy rule -- WCAG does not reach a drawn blade, and a meadow you
    # cannot pick one blade out of is not a meadow.
    #
    # SUNWASH IS NOBODY'S CHOICE. The room lays a 10% gold wash over the ground
    # from the top right, which is the last of the light coming over the
    # horizon, and that -- not the flat soil -- is what the type at the top of
    # the page actually sits on. Same rule as the Chappell's rose window, the
    # burrow's lamp pool and the cave's even light: the flat colour is never the
    # whole story, so every ink is held against both.
    (SWG_STRAW,  SWG_SOIL,    False, "sweetgrass: body copy, the lede, the spec list"),
    (SWG_STRAW,  SWG_WASH, False, "sweetgrass: the same, up where the light is"),
    (SWG_STRAW,  SWG_SHADE,   False, "sweetgrass: body copy inside a sheltered plot"),
    (SWG_GLOW,   SWG_SOIL,    True,  "sweetgrass: h1, every h2, and the passages from the book"),
    (SWG_GLOW,   SWG_WASH, True,  "sweetgrass: the h1, which is at the top where the wash is"),
    (SWG_GLOW,   SWG_SHADE,   True,  "sweetgrass: a plot's own heading"),
    (SWG_SEED,   SWG_SOIL,    False, "sweetgrass: every link, and every press-to-play label"),
    (SWG_SEED,   SWG_WASH, False, "sweetgrass: the same, near the top of the page"),
    (SWG_SEED,   SWG_SHADE,   False, "sweetgrass: links inside a plot"),
    (SWG_AWN,    SWG_SOIL,    False, "sweetgrass: the trailmark, the notes under each recording"),
    (SWG_AWN,    SWG_WASH, False, "sweetgrass: the trailmark, which sits under the wash"),
    (SWG_AWN,    SWG_SHADE,   False, "sweetgrass: a plot's body copy"),
    (SWG_SEDGE,  SWG_SOIL,    False, "sweetgrass: who published a recording, the runtimes, the "
                             "strand numbers, the caption under Ryan's video"),
    (SWG_SEDGE,  SWG_WASH, False, "sweetgrass: the same near the top"),
    (SWG_BAND,   SWG_SOIL,    False, "sweetgrass: the roots line at the foot of the braid"),
    (SWG_BAND,   SWG_WASH, False, "sweetgrass: the same, if the page is short"),

    # ── The Adventurer's Guild (§26) ──────────────────────────────────────
    # Alternating rows mean either ink can land on either paper, so both are
    # held against both rather than against whichever one they were designed on.
    # --gu-rule is the hairline and carries no text; it is in ORNAMENT with what
    # it measures, because a printed rule that cleared 4.5 would be a bar.
    (GU_INK,    GU_PAPER,  False, "guild: body copy, the lede, every job's posting"),
    (GU_INK,    GU_PAPER2, False, "guild: the same, in an alternating row and on the counter"),
    (GU_INK2,   GU_PAPER,  False, "guild: the docket line, how long a job takes, the inn note"),
    (GU_INK2,   GU_PAPER2, False, "guild: the class's 'on the street' line in a shaded row"),
    (GU_FILE,   GU_PAPER,  False, "guild: every link, the hint summaries, the class numeral"),
    (GU_FILE,   GU_PAPER2, False, "guild: the same, in an alternating row"),
    (GU_STAMP,  GU_PAPER,  False, "guild: the DONE stamp, and the storage warning"),
    (GU_STAMP,  GU_PAPER2, False, "guild: the DONE stamp on an alternating row"),
    (GU_PAPER,  GU_INK,    False, "guild: the hand-it-in button, reversed out of the ink"),
    (GU_INK,    GU_PAPER,  True,  "guild: h1 and the job titles, in Rye"),
    (GU_INK2,   GU_PAPER,  False, "street: the guild's door blurb"),
    (GU_FILE,   GU_PAPER,  False, "street: the guild's door knock"),

    # ── THE JOB MARKERS, ONE PER ROOM (§4 + every room) ───────────────────
    # WCAG 1.4.3 does not reach a drawing, and these are held to the body
    # threshold anyway -- the Jungle Room's quills rule: a marker you cannot
    # pick out of the floor is a CONTROL you cannot use, and nobody should have
    # to remember afterwards which bar applied. Each one is its own object in
    # its own room's colours, so there is one line here per room and no shared
    # value to check once and assume.
    #
    # THE PLAYHOUSE IS THE ONE THAT LOST AN ARGUMENT TO ITS OWN FLOOR. That
    # room reaches for yellow for everything, and yellow on its blue measures
    # 3.88. The block is white, which is 5.08 and is also what that room already
    # sets its body copy in; the near-black outline round it is the room's own
    # 5px edge and is ornament on top of a fill that already passes.
    (CHALK,     INK,       False, "marker: the chalk mark on the street's kerb"),
    ("#2b0a1c", HOT,       False, "marker: the sequin on the pony's dancefloor"),
    (LEAF,      NAVE,      False, "marker: the rhinestone on the chapel floor"),
    (PASTE,     BRICK,     False, "marker: the safety pin on the club's wall"),
    (INK,       PAPER,     False, "marker: the staple on the zine table, and the clip on issue two"),
    (CYAN,      INK,       False, "marker: the detector in the quantum room's fringes"),
    (GREEN,     INK,       False, "marker: the peeling sticker in Enid's room"),
    ("#ffffff", BLUE,      False, "marker: the wooden block on the Playhouse floor"),
    (COIN,      CARPET,    False, "marker: the token on the arcade carpet, and the quill by the cabinet"),
    (SHELLY,    CARPET,    False, "marker: the clam shell at the otter cabinet"),
    (COBBLE,    CARPET,    False, "marker: the pebble at the pebbling cabinet"),
    (UMBER,     PLASTER,   False, "marker: the key on its hook in the burrow"),
    (SAP,       CANOPY,    False, "marker: the fallen leaf in the Jungle Room"),
    (RATTAN,    PANEL,     False, "marker: the spindle adapter on the den floor"),
    (MOP_BONE,  MOP_STONE, False, "marker: the library card in the Mopery"),
    (ORC_BRASS, ORC_SLATE, False, "marker: the lozenge cut from the oracle's rule"),
    (DSC_INK2,  DSC_PAPER, False, "marker: the foxing on the doomscroll's roll"),
    (YELLOW,    INK,       False, "marker: the keys in Your Room's door, and the colophon in the liner notes"),
    ("#2B2621", "#EDE3CC", False, "marker: the bulldog clip on the Pebble Board"),
    (BONE,      DUSK,      False, "marker: the tent peg in the campground"),
    (TALLOW2,   CANVAS,    False, "marker: the candle stub on the Faery Yurt's windowsill"),
    (SWG_GLOW,  SWG_SOIL,  False, "marker: the firefly in the meadow grass"),
    (FURROW,    NOON,      False, "marker: the sunflower head at the hermitage"),

]

# NOT IN THE LIST, AND IT SHOULD BE: cream (#FFF3E6) on the same #FF5AA6 ground
# measures 2.64 and fails. That is the Pink Pony Club's own h1 and h2, over the
# room's own glow, on the live page -- flat on #FF3D9A they are 3.01, which is
# 3:1 by four thousandths, and any ray at all takes them under. Adding the pair
# here without fixing the room would only turn every run red, and the fix is a
# choice about how that room looks, which is not a checker's to make. It is
# written down here rather than in a commit message because this file is where
# somebody goes looking. The share card leaves the glow off until it is decided.


fails = []
for fg, bg, large, where in PAIRS:
    need = 3.0 if large else 4.5
    r = ratio(fg, bg)
    tag = "large" if large else "body "
    if r < need:
        fails.append((r, need, fg, bg, where))
        print(f"FAIL  {r:5.2f} (need {need}) {tag}  {fg} on {bg}  — {where}")

print(f"\n{len(PAIRS)} pairs checked, {len(fails)} failing.")

# EVERY COLOUR DECLARED IN :root IS EITHER MEASURED ABOVE OR NAMED BELOW WITH A
# REASON, AND THIS REFUSES OTHERWISE. It began as a printed note because the
# list it produced was thirteen colours long and nobody had looked at any of
# them; the list is resolved now, so it can do the job a checker is for.
#
# WHAT RESOLVING THEM TURNED UP, because it is the argument for the check:
# five were a palette the pebbling cabinet outgrew -- declared in :root, painted
# nowhere, and superseded by lighter values in pebbling.js that this file does
# measure. One carried TEXT nobody had noticed (the START button's hover ground)
# and was misnamed after a colour in a different room. One was the Faery Yurt's
# ivy, which Helen's own copy asks you to look at. And one was a brand strip on
# the campfire's television at 1.54 against its own casing -- invisible
# ornament, lightened until it was ornament you can see.
#
# ORNAMENT THAT CARRIES NO TEXT AND IS NOT REQUIRED TO UNDERSTAND ANYTHING IS
# EXEMPT, WITH ITS MEASUREMENT WRITTEN DOWN rather than waved through. The bar
# this site holds decoration to is its own, not WCAG's: a canopy you cannot make
# out is not a canopy, and a quill you cannot pick out is a control you cannot
# use. Neither of those applies to the shading inside a drawing or to a band of
# stained glass, and forcing 3:1 on a jewel colour would wash out the thing it
# is for. Each line says what it is and what it measured.
# MEASURED, BUT NOT AS ITSELF. A flat colour that nothing ever appears on in
# its flat state is checked through the thing it actually becomes. Exempting it
# here is not waving it through; the composite above is the stricter test.
VIA_COMPOSITE = {
    "#0a3240": "arcade: the shoal, the upper half of the kelp bay's water. Everything "
               "there is measured against SHOAL_LIT, what the scanline makes of it, "
               "which is the lighter of the bay's two grounds and therefore the one "
               "that decides.",
}

ORNAMENT = {
    "#a2977e": "guild: the hairline rule between jobs and under the docket, 2.22 on the "
               "manila. It carries no text and is the one thing in that room that is "
               "SUPPOSED to be faint -- a printed rule that cleared 4.5 would be a bar. "
               "The room's own inks are all measured above, against both papers.",
    "#38491f": "yurt: the dark half of Helen's ivy, 2.53 against the ivy it shades. "
               "Two tones of one drawn plant; the plant itself clears 3.9 on every "
               "ground it is on, which is the thing you have to be able to see.",
    "#3a2a20": "yurt: the plank under the bookshelf, 1.38 on the tent ground. It is a "
               "gradient to transparent that reads as the shelf's shadow, not an object. "
               "It is Helen's and is left as she drew it; the measurement is here so the "
               "next person finds a decision rather than an oversight.",
    "#8b0e33": "chappell: ruby in the glass band and the rose window, 1.95 on the nave.",
    "#14406e": "chappell: sapphire, 1.75 on the nave.",
    "#0e5c3a": "chappell: emerald, 2.30 on the nave.",
    "#5b2a8f": "chappell: amethyst, 1.91 on the nave. The four glass colours carry no "
               "text -- love.css has said so since that room was built -- and they are "
               "deep because stained glass is. Lifting them to 3:1 would not make the "
               "window clearer, it would make it not a window.",
    "#143a24": "jungle: the hairline round a gallery panel and a stripe in that door's "
               "awning, 1.30 on the understory. A separator inside a room that is dark "
               "on purpose; every word in there is measured against the shaft composite.",
    "#6b4f35": "board: the cork behind the paper, 1.99 against the ink on the cards "
               "laid over it. Nothing reads directly on the cork except the contents "
               "list, which is measured above in paper rather than ink; every card is "
               "opaque, so the cork is the surface a pin goes into and not a ground "
               "type sits on.",
    "#486a61": "board: the lit top edge of the frame and the dashed rule round the back-"
               "issue rack, 2.30 on the night outside it. Structure you feel rather "
               "than read -- the rack's own heading and text are measured above.",
    "#f6e3b8": "board: the lamp over the noticeboard, a 42% radial wash that lands on "
               "the frame and the cork and never under a word. Also measured as type "
               "above, because the rack's heading is set in it.",
    "#e3dccb": "mopery: the mount each of Dore's engravings is printed on, 12.01 on the "
               "case panel behind it. The plates are near-white at the edges and would "
               "float with no object under them on a blue-black wall; this is the paper "
               "they were printed on, and nothing is set on it. Not in :root -- it is "
               "written into the rule -- and measured here because the number is worth "
               "having in the one place this site keeps numbers.",
    "#d8d0be": "mopery: the mount behind each leaf of the 1865 scan, 10.69 on the same "
               "panel. Same reason as the plates' mount and the same lack of text on it.",
    "#6a4a2a": "mopery: the wax of every candle on the top shelf and down both jambs "
               "of the parlour screen, 1.66 on the room. It is a drawn object carrying "
               "no words, and the room's argument depends on the candlelight NOT "
               "reaching the walls -- lifting it would be lighting the library.",
    "#3a434e": "mopery: every hairline in the room -- the case borders, the rules under "
               "a shelf card, the double rule between sections, the shelf board itself. "
               "2.23 on the room. Structure you feel rather than read; nothing is set "
               "in it.",
    "#3a342f": "oracle: the cut rule, the edge of every card and the line above each "
               "plate's credit, 1.36 on the slate. A stonecutter's hairline, and the "
               "only thing in that room that is not either a picture or a sentence.",
    "#8a8073": "doomscroll: the rules between items, the double rule under the masthead "
               "and the curl at each end of the roll, 2.70 on the paper. Printed rules "
               "carry no words; every line of type on that scroll is measured above.",
    "#4e6b2e": "sweetgrass: every drawn blade in the back row of every band, the rule "
               "under each recording, the stem beside a quotation and the ring of "
               "stones round the fire. 2.93 on the meadow ground and 2.49 under the "
               "sun wash. It carries no words and never has; it is measured because "
               "the Jungle Room's canopy came out at 2.18 and was a smudge nobody "
               "could tell one leaf from another in, and a meadow has the same "
               "problem the moment its darkest green stops separating from the "
               "ground. The two greens in front of it clear the body threshold.",
    "#bfe07a": "campgrounds: the fireflies in pitch 02's drawing, 12.00 on the field "
               "and 10.89 on the spruce masses in it. A "
               "picture's ink rather than a room's palette, hardcoded in "
               "campgrounds.html the way the yurt's candle and the hermitage's moon "
               "are — and the one lit colour that pitch is allowed, because the other "
               "two are taken. It is CARRIED rather than emitted or caught: many "
               "small lights held in the grass, no source you could point at.",
    "#2a3a31": "campgrounds: the board's frame and the post each pitch hangs off, 1.48 "
               "on the field. That field is deliberately the dimmest ground on the "
               "street and its type carries all of it -- bone at 14.7, moss at 7.3. The "
               "post is structure you feel rather than read.",
}

# MEASURED MEANS "IN A PAIR", not "appears somewhere in this file". The first
# version scanned the whole source, which meant the ORNAMENT list below counted
# its own entries as measured and the check passed while doing nothing at all --
# a vacuous green, which is worse than the printed note it replaced. Tested by
# adding a colour to :root and watching it refuse.
measured = {c.lower() for fg, bg, _, _ in PAIRS for c in (fg, bg)}
stray = [h for h in sorted(declared() - measured)
         if h not in ORNAMENT and h not in VIA_COMPOSITE]
if stray:
    print("\nREFUSING: declared in love.css's :root and measured nowhere here:")
    for h in stray:
        print("   " + h)
    print("\nMeasure it, or name it in ORNAMENT or VIA_COMPOSITE with what it is\n"
          "and what it measured.\n"
          "A colour this file has never seen is a colour nothing is checking.")
    sys.exit(1)

sys.exit(1 if fails else 0)
