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
# READ OUT OF data/hermitage.json, WHICH IS WHERE THE PAGE GETS THEM: each bag
# carries its own hex inline, and these three had been written here from a
# palette the room does not use — lighter by a long way, and passing. Found by
# check-contrast-live.py, which measures the page instead of the intention.
BAG1, BAG2, BAG3 = "#E2701B", "#E064AB", "#1DA197"
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
PBGOLD, PBGOLD_BG = "#866A2E", "#FFF3D0"
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

# The Feed (§27). A dark concourse with lit machines standing in it. FD_POOL is
# the composite nobody declared: --fd-lamp at 4% over the hall, the wash the
# boards throw on the floor, and what the room's prose actually sits on -- the
# Chappell's rose window and the burrow's lamp pool, in a station.
# FD_ PREFIXED, and not optionally: LAMP is already the Faery Yurt's candle
# colour two hundred lines up, HALL and FLAP and SPLIT are the kind of plain
# word this file fills up with, and an unprefixed LAMP here would have silently
# repainted the yurt's pairs -- which is exactly what an unprefixed GLOW did to
# six of Helen's when Swaying Sweetgrass was added. Pre-empted this time.
FD_HALL, FD_ENAMEL, FD_FLAP, FD_POOL = "#1D2124", "#0B0E10", "#141A1D", "#25292C"
FD_GIRDER, FD_SPLIT, FD_FOLD = "#6B7479", "#04070A", "#313A3F"
FD_FLAP_LO = "#0F1417"
FD_LAMP, FD_DIM, FD_AMBER, FD_SIGNAL = "#EFEAE0", "#9AA4A9", "#F0B542", "#63CBA2"

# The Garden (§28). MIDDAY, AND THE LIGHT HAS COME THROUGH A LEAF, which is what
# separates it from the two other rooms on this street that can be read by
# daylight: the Hermitage's sun lands on a warm plaster WALL, the Guild has no
# light source in it at all, and this pale is green.
# THERE IS NO COMPOSITE IN THIS ROOM, and that is the one thing about it worth
# saying here. Everywhere else on the street the ground a word sits on is a
# thing nobody declared -- the Chappell's rose window, the burrow's lamp pool,
# the arcade's scanline, the meadow's sun wash -- and this file has to
# reconstruct it. GD_DAPPLE is an opaque declared colour painted as the leaf
# shadow, so the second ground is measured as itself.
# GD_ PREFIXED, because DAY, BOARD, LEAF, SHADE and BLOOM are all either taken
# already or the kind of plain word this file fills up with: LEAF is The
# Chappell's gold, and an unprefixed one here would silently repaint it. That is
# the --leaf collision, pre-empted for the third time rather than discovered.
GD_DAY, GD_DAPPLE, GD_BOARD = "#F2F7E9", "#EBF2DF", "#FCFDF6"
GD_EDGE = "#9DB183"
GD_LOAM, GD_LOAM2 = "#2B2013", "#5A462C"
GD_LEAF, GD_LEAF2, GD_BLOOM = "#2F6B1E", "#55893A", "#A8390B"


# The Zibaldone (§29). A BOOK LYING ON A DESK, LIT FROM ONE SIDE, which is the
# whole of its separation from the other paper rooms on this street -- all of
# them printed, none of them lit from anywhere you could point at. Two papers,
# because a leaf is a slip laid on a page and half the type in the room sits on
# the slip rather than on the page: every ink is measured against BOTH, and the
# slip is the darker of the two, so it is the harder test.
# THE RAKING LIGHT IS A GRADIENT AND IS NOT MEASURED HERE, on purpose. Every
# sheet carries a flat background-color underneath it and the gradient only
# lightens the left-hand end, so ZB_LAID is the DARK end of the real range --
# the honest ground rather than the flattering one. That also keeps the room
# readable to check-contrast-live.py, which declines to guess at a gradient
# with no colour under it rather than falling through to the body.
# ZB_PENCIL STARTED AT #6B6253 AND MEASURED 4.43 ON A LEAF, under the bar, and
# it carries every citation, every margin note and every provenance line in the
# room. It was darkened before the room shipped. That is this file doing the
# job it exists for: a colour it has never seen is a colour nothing is checking.
ZB_DESK, ZB_DESK2 = "#2A211A", "#3A2E24"
ZB_LAID, ZB_LAID2, ZB_GUTTER = "#F2E8D5", "#E9DCC3", "#C9B693"
ZB_OAK, ZB_IRON, ZB_ANILINE = "#3A2A18", "#2B3348", "#5B2E6E"
ZB_RUBRIC, ZB_PENCIL, ZB_TAPE = "#8C2B18", "#635A4B", "#DFCDA8"


# The Rabbit Hole (§30). A SHAFT, AND THE GROUND DARKENS DOWN THE DOCUMENT --
# which is a shape of ground this file has not had before and needed a decision
# about. The body carries a flat background-color with the gradient painted over
# it in background-image, the Zibaldone's arrangement, but the flat colour here
# is the LIGHTEST end rather than the darkest. That is not an inconsistency: in
# both rooms the flat colour is the WORSE case for the type standing on it, and
# this room sets pale type on a dark wall where that room sets dark type on pale
# paper. RH_SLATE is therefore the honest ground rather than the flattering one,
# and it is what check-contrast-live.py will read.
# AND EVERY BLOCK THAT CARRIES TEXT SITS ON A FLAT PANEL OF ITS OWN, because the
# gradient runs the height of the DOCUMENT rather than the height of a sheet --
# so the colour under a word depends on how far somebody has scrolled, and no
# single flat value could honestly stand in for it. The only type left on the
# gradient is in the header, where the flat colour and the gradient's first stop
# are the same value. Both panels are measured anyway.
# THE PAPER MATS ARE THE ROOM'S SECOND GROUND AND GET THEIR OWN LINK COLOUR.
# RH_BRASS is 6.74 and up on all three dark grounds and 1.83 on the mats, so a
# room-level link colour alone would have shipped an illegible provenance line
# under every engraving -- the hole The Doomscroll left and the Playhouse had
# been carrying since it opened, caught here before the room shipped rather than
# by somebody looking at the page. RH_BRASS_DARK is the decision.
# RH_GRAPHITE AND RH_ROOT CARRY NO TEXT and are in ORNAMENT with what they came
# out at. They are the ribs of the shaft and the roots at its rim.
RH_SLATE, RH_SLATE2, RH_DEEP = "#262C35", "#171C23", "#0B0E13"
RH_CHALK, RH_DIM, RH_DAYLIGHT = "#DEDCD4", "#A2ABB6", "#BFC6CC"
RH_BRASS, RH_BRASS_DARK = "#D9AE3A", "#6B4A0E"
RH_PAPER, RH_INK = "#F3F0E7", "#15181C"


# The Healing Checkpoint (§31), room 429. A SAVE ROOM LIT FROM THE FLOOR, which
# gives this file a shape it has met once before and inverted: the light is a
# FIXED layer rather than a scrolling one, so what is under a word depends on
# where that word is in the VIEWPORT rather than on how far down the document it
# was written. No single flat value can honestly stand in for that, which is why
# every block in that room that carries text sits on a flat panel of its own and
# only the header is left standing on the room itself.
# HC_CHAMBER IS THE FLAT BODY GROUND AND IT IS THE LIGHTEST OF THE THREE DARKS,
# The Rabbit Hole's arrangement and its reason: pale type on a dark wall takes
# the lightest ground as its honest flat colour, because that is the worse case
# for the type standing on it.
# HC_LIT IS NOBODY'S CHOICE. It is HC_GLIM at .10 over HC_CHAMBER -- the peak
# stop of the pool in the floor, computed rather than picked -- and it is what
# the header's type sits on once anything has been scrolled. The Chappell's rose
# window, the burrow's lamp pool, the arcade's scanline and the meadow's sun
# wash are all measured this way, because a flat background is never what the
# text is on.
# HC_CLAY IS THE ONLY WARM VALUE IN THE ROOM AND IT IS NEVER A GROUND. Five warm
# enclosed rooms on this street are warm underfoot; the moment a surface in room
# 429 goes warm it is the Faery Yurt with a spring in it. It is held against all
# five grounds anyway, because the plaque, the tagline, the quotations and the
# copy readout put it on four of them.
HC_CHAMBER, HC_ALCOVE, HC_VAULT = "#131E20", "#0E1719", "#0A1112"
HC_LIT, HC_SPRING = "#1D3131", "#0C3B40"
HC_STEAM, HC_DIM = "#EAF2F0", "#A6BAB8"
HC_GLIM, HC_CLAY = "#79DCCE", "#DDB49B"

# The Foundry (§32). A GREY IRON WORKSHOP, and the first MID-GREY ground this
# file has had to hold. Every other room here is a dark ground or a sheet of
# paper; this one sits between them, which means its inks have less room than a
# night room's and more than a paper room's, and every one of them was moved at
# least once to fit.
# FO_LIT IS NOBODY'S CHOICE AND IT IS THE PAIR THAT DECIDED THE ROOM. It is the
# north light's own wash at its top stop -- FO_ROOF at .46, then the sawtooth
# stripe at .16 over that -- composited onto the floor. Held against it, the
# room's link brass came out at 3.14 and its fine print at 3.34, so the LIGHT
# moved rather than the palette: it is 340px tall and absolute instead of fixed
# and full height, which stops it arriving under an arbitrary paragraph
# depending on how far somebody has scrolled. The only words standing in it now
# are the topline's, and they are bone at 5.19 for that reason.
# FO_LEAD IS ORNAMENT AND CARRIES NO TEXT: 3.66 on the floor. It rules, borders
# and edges and never says anything.
# THE FOUR PROOF PAIRS ARE THE ONES THE VISITOR CHOOSES BETWEEN, which makes
# this the one room on the street where somebody other than us picks the colour
# of the text. They live in data/foundry.json with their measured ratios printed
# on their own controls, make-foundry.py refuses one under 4.5, and they are
# held here as well because a number in a data file is a claim and this is where
# claims get checked.
FO_FLOOR, FO_BENCH, FO_LIT = "#3F4548", "#2E3335", "#596267"
FO_BONE, FO_OIL, FO_BRASS = "#EDEAE3", "#B9BFBD", "#DCB262"
FO_PAPER, FO_INK = "#E8EAE9", "#16181A"
FO_RED, FO_BLUE = "#8A1A12", "#10395C"

# Danny the Street (§33). ONE HUE, WHICH IS THE ROOM'S WHOLE ARGUMENT AND ALSO
# what makes this the shortest block in the file: low-pressure sodium is
# effectively one wavelength, so nothing under a street lamp has a colour of its
# own and there is no second family of inks to hold. Two grounds -- the bare tar
# and DN_LIT, what the lamp's own pool makes of it at its strongest, which is
# the lighter of the two and therefore the one that decides.
# DN_KERB IS ORNAMENT AND CARRIES NO TEXT: 3.08 and 2.62. It is in ORNAMENT with
# those numbers beside it.
DN_TAR, DN_LIT = "#1A1917", "#2D261B"

# The Outskirts (§34). TWO GROUNDS: the road itself, and the face of a sign
# standing in the beam. The board is DARKER than the night around it, because
# a painted board lit from one low angle is a dull surface rather than a lamp --
# so it is the harder ground and every ink is measured against both.
# OSK_WEED IS ORNAMENT AND CARRIES NO TEXT: 4.04 and 3.51. It shipped on the
# topline note and on the line under each turning for exactly as long as it took
# to measure it, which is the argument for measuring before believing a palette.
# It is in ORNAMENT with those numbers beside it.
OSK_NIGHT, OSK_BOARD = "#08090B", "#1A1B17"
OSK_BEAM, OSK_DIM, OSK_RUST = "#EDE7D6", "#A9A491", "#D96A3C"

# Black Leather Lagoon (§35). TWO GROUNDS: the water, and a lobby card out in
# it. THERE IS NO THIRD GROUND FOR THE SCREEN, and that is worth saying: the
# screen is the light source in this room, not a surface anything is set on --
# nothing is ever written on it, because what is on it is somebody else's video.
LAG_WATER, LAG_CARD = "#07090A", "#12161A"
LAG_SCREEN, LAG_DIM = "#E6E2D2", "#A7AFA0"
LAG_ACID, LAG_POSTER = "#8CC63F", "#E4564A"

# Sithen (§36). TWO GROUNDS, and NO GREEN IN EITHER, which is the section's own
# rule and the thing that holds this off the campgrounds: grass under a full
# moon has a brightness rather than a colour, so every value sits on one
# grey-violet line. The bank is the earth of the ring and of every panel.
# STH_THORN IS ORNAMENT AND CARRIES NO TEXT: 3.69 on the field and 3.30 on the
# bank. It draws thorns, branches and rules, and the room's marker is drawn in
# the MOON instead precisely because a marker is held to the body threshold.
STH_NIGHT, STH_BANK = "#0C0B12", "#1A1822"
STH_BONE, STH_DIM, STH_MOON = "#EDEAF2", "#A7A2B8", "#BDB0DE"

# Covenstead (§37). TWO GROUNDS AND THREE GLAZES, and every glaze carries text,
# which is why this room has no ORNAMENT entry at all -- still the only one.
# The room moved off The Outskirts onto the street and changed worlds doing it:
# it was a dark kitchen lit by several mismatched lamps and it is now a daylit
# one with several mismatched cups. The two grounds are the patch of afternoon
# sun where the window light lands and the limewash around it, 1.12 apart --
# which is what an ordinary room looks like, and why both are safe grounds for
# text rather than one being an effect laid over the other.
COV_WASH, COV_SUN = "#F3E9E1", "#FCF7EF"
COV_INK, COV_INK_2 = "#2A211C", "#5E5048"
COV_DELFT, COV_SAGE, COV_ROSE = "#2F5E86", "#41643A", "#A1384A"

# Looming Rocks Amphitheatre (§38). TWO GROUNDS: unlit stone, and a rock face
# with a flood on it. The floods point UP, which nothing else on this street
# does, so a panel is lighter at its FOOT and the flat colour under the gradient
# is the lighter end -- the worse case for the pale type standing on it.
# THE LICHEN IS A CYAN-GREEN AND THE LAGOON'S ACID IS A YELLOW-GREEN, one
# turning along the same road: 200 blue against 63. That is the pair to watch on
# this street, because two music rooms on one road sharing a green would be the
# harmonising instinct arriving through a palette.
LR_ROCK, LR_FACE = "#15120F", "#241E18"
LR_BONE, LR_DIM = "#EDE7DC", "#ABA196"
LR_UV, LR_LICHEN = "#A579F0", "#4FD8C8"
DN_PAINT, DN_CHALK, DN_SODIUM = "#F1EADA", "#C0B8A6", "#F0A73F"

PAIRS = [
    (PINK,    INK,  True,  "street: tagline 'Queer without fear' 25px Archivo Black"),
    (ORANGE,  INK,  True,  "street: tagline 'Interdependent and here' 25px"),
    (GREEN,   INK,  True,  "street: tagline 'Divergent and proud' 21px bold display"),
    (CYAN,    INK,  True,  "street: tagline 'Living out loud' 27px"),
    (YELLOW,  INK,  False, "street: tagline 'Plucky pluralism' 16px Rock Salt"),
    (VIOLET,  INK,  True,  "street: tagline 'ribald songing' 30px VT323"),
    ("#ffffff", INK, True, "street: wordmark"),
    (CHALK,   INK2, False, "street: pavement + dial fine print"),
    (CHALK,   INK,  False, "street: the paragraph under the dial saying who Danny is, "
                          "which is the credit the scrolling marquee cannot give a "
                          "screen reader"),
    ("#ffffff", INK, False, "street: the bold run in that paragraph"),
    (YELLOW,  INK,  False, "street: its two links to the page about the name"),
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
    # THE LINKS, WHICH NOBODY HAD DECIDED UNTIL 2026-09-21. The room's `a` was
    # yellow and every link on the page sits either on the blue ground or
    # inside a white card: 3.88 and 1.31, both live, neither visible to this
    # file because an inherited colour was never a decision. The Doomscroll's
    # hole, in an older room. Both grounds are decided now and both are here.
    (BLUE,     "#ffffff", False, "playhouse: links inside the house-rules cards"),

    # THE SKIP LINK, which is shared furniture and had never been in this file
    # at all. It carries its own yellow ground and its own ink, and every room
    # set `.room-x a` at a specificity that reached through: 1.00 to 2.21 across
    # twenty-one rooms, on the first control a keyboard user meets. Found by
    # check-contrast-live.py on its first run, because this file can only hold a
    # pair for what somebody decided and the rooms were overriding the decision.
    (INK,      YELLOW,    False, "every room: the skip link, guarded in \u00a72"),

    # THE TEN TOYS ARE TEN FILLS AND NONE OF THEM NEEDED A NEW PAIR, which is
    # worth writing down rather than leaving as an absence: the six added in
    # 2026-09-21 reach for colours this file already holds against the room's
    # near-black — cyan, pink and light violet from the sound board's keys and
    # Enid's stickers, white from the house-rules card, red from the secret-word
    # box, and yellow-and-cream on near-black from the says-box and the mood
    # keys. The one that had to be measured rather than assumed is the red
    # tile's 13.5px blurb, #ffe0e2 at 5.03, because a near-white on a saturated
    # red is exactly where a fill passes at display size and fails underneath.

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

    # ── The Feed (§27) ────────────────────────────────────────────────────
    # FOUR GROUNDS, because this room has four and type lands on all of them:
    # the hall, the wash the boards throw on its floor, a board's carcass and
    # a flap's own face. Every ink is held against every ground it is actually
    # on rather than against the one it was designed on.
    (FD_LAMP,   FD_HALL,   False, "feed: the lede and the body of every bay"),
    (FD_LAMP,   FD_POOL,   False, "feed: the same, under the pool of board light"),
    (FD_DIM,    FD_HALL,   False, "feed: the eyebrow, the where line, both generated lines"),
    (FD_DIM,    FD_POOL,   False, "feed: the same, under the pool"),
    (FD_AMBER,  FD_HALL,   False, "feed: the tagline and every h2"),
    (FD_AMBER,  FD_POOL,   False, "feed: the same, under the pool"),
    (FD_SIGNAL, FD_HALL,   False, "feed: every link in the room's prose, and the backlink"),
    (FD_SIGNAL, FD_POOL,   False, "feed: the same, under the pool"),
    (FD_LAMP,   FD_HALL,   True,  "feed: h1 'The Feed' in Michroma"),
    (FD_LAMP,   FD_ENAMEL, False, "feed: each board's nameboard, and the quest panel's copy"),
    (FD_DIM,    FD_ENAMEL, False, "feed: a wire's note, its second-feed line, both halves of the plate"),
    (FD_AMBER,  FD_ENAMEL, False, "feed: the minute a wire was read, on the plate"),
    (FD_SIGNAL, FD_ENAMEL, False, "feed: the feed link on every plate"),
    (FD_LAMP,   FD_FLAP,   False, "feed: every destination on every row"),
    (FD_AMBER,  FD_FLAP,   False, "feed: every date column"),
    # THE GIRDER IS AN OBJECT'S OUTLINE, the Hermitage's chairs rule: a board
    # you cannot pick out of the hall is not a board, so the edge is measured
    # against every ground it runs against and held to the graphics bar. It was
    # #2A3034 first and measured 1.02 on the pool -- the board's own edge gone
    # exactly where the light was brightest, which is the one place nobody
    # would have thought to look.
    (FD_GIRDER, FD_HALL,   True,  "feed: a board's frame and legs, against the hall"),
    (FD_GIRDER, FD_POOL,   True,  "feed: the same, standing in the pool of its own light"),
    (FD_GIRDER, FD_ENAMEL, True,  "feed: the rules inside a board, on the carcass"),
    (FD_GIRDER, FD_FLAP,   True,  "feed: a row's underline against the flap it is on"),
    (FD_LAMP,   FD_ENAMEL, False, "street: the feed's door name in Michroma"),
    (FD_DIM,    FD_ENAMEL, False, "street: the feed's door blurb"),
    (FD_SIGNAL, FD_ENAMEL, False, "street: the feed's door knock"),

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
    (FD_AMBER,  FD_HALL,   False, "marker: the flap on the floor of The Feed's concourse"),
    (FD_AMBER,  FD_POOL,   False, "marker: the same, where the board light reaches the floor"),

    # ── The Zibaldone (§29) ─────────────────────────────────────────────────
    # TWO PAPERS AND EVERY INK AGAINST BOTH. The page is the lighter one and a
    # leaf pasted onto it is the darker, so the leaf is the test that matters
    # and every ink is held to it. The desk is the room's second ground and it
    # carries exactly two things -- the way back to the street and the line
    # under it -- which is a decision made HERE rather than inherited, because
    # this is a pale room on a near-black street and the base stylesheet's link
    # pink would arrive at about 2.4. That is the hole The Doomscroll left and
    # the Playhouse had been carrying since it opened.
    (ZB_OAK,     ZB_LAID,   True,  "zibaldone: h1 in EB Garamond, 44-78px, and every h2"),
    (ZB_OAK,     ZB_LAID,   False, "zibaldone: body copy, the rules list, every slip label"),
    (ZB_OAK,     ZB_LAID2,  False, "zibaldone: a quotation written in oak, a bold run in a citation"),
    (ZB_IRON,    ZB_LAID,   False, "zibaldone: body copy on a page where iron is the ink"),
    (ZB_IRON,    ZB_LAID2,  False, "zibaldone: a quotation written in iron gall"),
    (ZB_ANILINE, ZB_LAID,   False, "zibaldone: a link being hovered, and the slip's extra-field rule"),
    (ZB_ANILINE, ZB_LAID2,  False, "zibaldone: a quotation written in aniline violet"),
    (ZB_RUBRIC,  ZB_LAID,   False, "zibaldone: every link on the paper, the tagline, the rule under an h2"),
    (ZB_RUBRIC,  ZB_LAID2,  False, "zibaldone: the 'Copied out' tag and the provenance tab's own link"),
    (ZB_PENCIL,  ZB_LAID,   False, "zibaldone: the eyebrow, every help line under a slip field"),
    (ZB_PENCIL,  ZB_LAID2,  False, "zibaldone: the citation, the margin hand, the provenance note. THE "
                                   "HARDEST PAIR IN THE ROOM and the one that moved: #6B6253 measured "
                                   "4.43 here and was darkened before this room shipped"),
    (ZB_LAID,    ZB_PENCIL, False, "zibaldone: the basis badge on a provenance tab, paper on pencil"),
    (ZB_LAID,    ZB_OAK,    False, "zibaldone: the one solid button in the room, 'Copy the slip'"),
    (ZB_LAID,    ZB_RUBRIC, False, "zibaldone: the same button while it is hovered"),
    # The desk. Two things stand on it and both are decided here.
    (ZB_TAPE,    ZB_DESK,   False, "zibaldone: the way back to the street and the line beside it, "
                                   "which sit on the desk rather than on the paper -- a second "
                                   "ground is a second decision"),
    (ZB_LAID,    ZB_DESK,   False, "zibaldone: anything the room sets in paper-colour on the desk"),

    # ── The Rabbit Hole (§30) ───────────────────────────────────────────────
    # THREE DARK GROUNDS AND ONE PALE ONE, and every ink against all of them it
    # can land on. The header's type sits on RH_SLATE, the ledges are RH_SLATE2
    # and RH_DEEP, and the engravings' mats are RH_PAPER. The slate is the
    # lightest of the three and therefore the hardest of the three for pale
    # type, so it is the pair that decides.
    ("#ffffff",     RH_SLATE,      True,  "rabbit hole: the h1 in Playfair Display, 42-76px, on the shaft wall"),
    ("#ffffff",     RH_SLATE2,     True,  "rabbit hole: every h2 and h3 on a ledge"),
    ("#ffffff",     RH_DEEP,       True,  "rabbit hole: every h2 and h3 on a deep ledge, and a hovered link"),
    (RH_BRASS,      RH_SLATE,      True,  "rabbit hole: the tagline 'You meant to look up one thing'"),
    (RH_BRASS,      RH_SLATE2,     False, "rabbit hole: every link on a ledge, and the performer's name on a press"),
    (RH_BRASS,      RH_DEEP,       False, "rabbit hole: every link on a deep ledge"),
    (RH_CHALK,      RH_SLATE,      False, "rabbit hole: the lede under the h1, and the section ledes"),
    (RH_CHALK,      RH_SLATE2,     False, "rabbit hole: body copy on a ledge, and every press note"),
    (RH_CHALK,      RH_DEEP,       False, "rabbit hole: body copy on a deep ledge"),
    (RH_DIM,        RH_SLATE,      False, "rabbit hole: the topline note, the way back to the street, "
                                          "the caveat lines under a section heading"),
    (RH_DIM,        RH_SLATE2,     False, "rabbit hole: a citation under a quotation, a press's runtime "
                                          "line, every line of the trail"),
    (RH_DIM,        RH_DEEP,       False, "rabbit hole: the same on a deep ledge"),
    (RH_DAYLIGHT,   RH_SLATE,      False, "rabbit hole: the eyebrow over the h1, which is the one thing "
                                          "in the room set in the colour of the sky"),
    (RH_DAYLIGHT,   RH_SLATE2,     False, "rabbit hole: a quotation set in daylight on a ledge"),
    (RH_DAYLIGHT,   RH_DEEP,       False, "rabbit hole: a quotation set in daylight on a deep ledge"),
    # The paper mats. A SECOND GROUND IS A SECOND DECISION, and brass fails here.
    (RH_INK,        RH_PAPER,      False, "rabbit hole: the sentence of ours beside every engraving, and "
                                          "the provenance line under it"),
    (RH_BRASS_DARK, RH_PAPER,      False, "rabbit hole: the small caps over each engraving, and EVERY LINK "
                                          "ON A MAT. RH_BRASS measures 1.83 here, so the mats have a "
                                          "colour of their own rather than inheriting the room's"),

    # ── The Foundry (§32) ───────────────────────────────────────────────────
    # THREE GROUNDS IN THE ROOM AND TWO PAPERS ON THE BENCH. The floor is the
    # room, the bench is everything standing on it, and FO_LIT is what the north
    # light makes of the floor in the top 340px -- which only the topline is in.
    (FO_BONE,  FO_LIT,   False, "foundry: the topline note and the way back to the street, "
                                "which are the only words standing in the light"),
    (FO_BONE,  FO_FLOOR, False, "foundry: the lede, every paragraph of the notes, and the "
                                "cases' own heading"),
    (FO_BONE,  FO_BENCH, True,  "foundry: the h1 in Stardos Stencil, and every family name "
                                "on the shelves set in itself"),
    (FO_BONE,  FO_BENCH, False, "foundry: the designer's name under each specimen, and every "
                                "control's own text on the bench"),
    (FO_OIL,   FO_FLOOR, False, "foundry: the line under the h1, the cases' fine print, and "
                                "every note in the room that is not on a panel"),
    (FO_OIL,   FO_BENCH, False, "foundry: the fine print under every control, each ink's "
                                "measured ratio, the colophon under the proof, and the "
                                "licence line under each specimen"),
    (FO_BRASS, FO_FLOOR, False, "foundry: every link in the lede and the notes, and every "
                                "shelf heading in the cases"),
    (FO_BRASS, FO_BENCH, False, "foundry: every control's label, the bench and desk "
                                "headings, and the eyebrow over the h1"),
    ("#22160A", FO_BRASS, False, "foundry: the print button, which is the one solid brass "
                                 "object in the room"),
    # The four the visitor chooses between. Each one is printed on its own
    # control with this number beside it.
    (FO_INK,   FO_PAPER, False, "foundry: printer's black on proof paper, the pair the "
                                "bench opens at"),
    (FO_RED,   FO_PAPER, False, "foundry: vermilion on proof paper"),
    (FO_BLUE,  FO_PAPER, False, "foundry: prussian blue on proof paper"),
    (FO_BONE,  FO_BENCH, False, "foundry: the proof reversed out, bone on iron"),

    # ── The Healing Checkpoint (§31) ────────────────────────────────────────
    # FIVE GROUNDS AND EVERY INK AGAINST THE ONES IT CAN LAND ON. The room is
    # HC_CHAMBER, the alcoves are HC_ALCOVE, the slips and the desk are
    # HC_VAULT, the water is HC_SPRING, and HC_LIT is what the pool in the floor
    # makes of the room. HC_LIT is the lightest of them and is therefore the
    # pair that decides for every pale ink.
    ("#ffffff",  HC_CHAMBER, True,  "checkpoint: the h1 in Quicksand, 38-66px, standing on the room"),
    ("#ffffff",  HC_LIT,     True,  "checkpoint: the same h1 where the pool in the floor reaches it"),
    ("#ffffff",  HC_ALCOVE,  True,  "checkpoint: every h2 in an alcove"),
    ("#ffffff",  HC_VAULT,   True,  "checkpoint: the desk's heading, and a slip's h2"),
    ("#ffffff",  HC_ALCOVE,  False, "checkpoint: every bold run in an alcove, and a held item's title"),
    ("#ffffff",  HC_VAULT,   False, "checkpoint: every bold run on the desk or inside a slip"),
    (HC_STEAM,   HC_CHAMBER, False, "checkpoint: the lede under the h1"),
    (HC_STEAM,   HC_LIT,     False, "checkpoint: the same lede under the pool's light"),
    (HC_STEAM,   HC_ALCOVE,  False, "checkpoint: body copy and every list item in an alcove"),
    (HC_STEAM,   HC_VAULT,   False, "checkpoint: a held item's reason, and a slip's label"),
    (HC_STEAM,   HC_SPRING,  False, "checkpoint: the sentence the room is built to protect, which is "
                                    "the one paragraph set on the water -- and the text of every "
                                    "Retry-After slip, which is set on it too"),
    (HC_DIM,     HC_CHAMBER, False, "checkpoint: the topline note over the door"),
    (HC_DIM,     HC_LIT,     False, "checkpoint: the eyebrow over the h1, and the topline under light"),
    (HC_DIM,     HC_ALCOVE,  False, "checkpoint: the source note under a heading, a citation under a "
                                    "quotation, and every line of the way out"),
    (HC_DIM,     HC_VAULT,   False, "checkpoint: a slip's note, a held item's credit, the desk's copy"),
    (HC_GLIM,    HC_CHAMBER, False, "checkpoint: every link standing on the room, and the backlink"),
    (HC_GLIM,    HC_LIT,     False, "checkpoint: the same, under the pool's light"),
    (HC_GLIM,    HC_ALCOVE,  False, "checkpoint: every link in an alcove, every h3, and the copy "
                                    "button's label"),
    (HC_GLIM,    HC_VAULT,   False, "checkpoint: a link on the desk, and a slip's open/close mark"),
    # THE ONE WARM INK, AND IT IS NEVER A GROUND. See the note above.
    (HC_CLAY,    HC_CHAMBER, True,  "checkpoint: the tagline, 20-26px bold"),
    (HC_CLAY,    HC_LIT,     True,  "checkpoint: the same tagline under the pool's light"),
    (HC_CLAY,    HC_ALCOVE,  True,  "checkpoint: the 429 on the plaque, 40px, and every quotation "
                                    "in Quicksand at 19-23px bold"),
    (HC_CLAY,    HC_ALCOVE,  False, "checkpoint: a hovered link in an alcove"),
    (HC_CLAY,    HC_CHAMBER, False, "checkpoint: a hovered link standing on the room"),
    (HC_CLAY,    HC_VAULT,   False, "checkpoint: what a slip says after you press copy, which is the "
                                    "readout ON the slip rather than at the top of the page"),
    # THE MARKER IS HELD TO THE BODY THRESHOLD, the Jungle Room's quills rule:
    # WCAG 1.4.3 does not reach a graphic, and a pillow you cannot pick out of
    # the floor is a control you cannot use. It is drawn in HC_STEAM and lies on
    # the room itself, so the pairs above already decide it -- 14.95 flat and
    # 12.02 lit -- and it is named here so nobody has to work that out later.
    (HC_STEAM,   HC_CHAMBER, False, "checkpoint: the job marker, a pillow lying on the floor"),

    # ── The Garden (§28) ────────────────────────────────────────────────────
    # THREE GROUNDS AND EVERY INK AGAINST ALL THREE: the path, the leaf shadow
    # on the path, and a limewashed board laid on it. The board is the pale one
    # and it is BRIGHTER than the room, which inverts this file's usual worry --
    # the danger here is an ink too light rather than too dim, the way it is in
    # the Hermitage.
    (GD_LOAM,   GD_DAY,    True,  "garden: h1 in Faustina, 40-76px"),
    (GD_LOAM,   GD_DAY,    False, "garden: a bed's habit line, bold runs in a note, the label's own name"),
    (GD_LOAM,   GD_DAPPLE, False, "garden: the same, where the leaf shadow falls on the path"),
    (GD_LOAM,   GD_BOARD,  False, "garden: a bed's label, and every bold run on a limewashed board"),
    (GD_LOAM2,  GD_DAY,    False, "garden: the lede, the trailmark, every note and the who-line"),
    (GD_LOAM2,  GD_DAPPLE, False, "garden: the same, under the leaf shadow"),
    (GD_LOAM2,  GD_BOARD,  False, "garden: the notices on a board, and a label's host line"),
    (GD_LEAF,   GD_DAY,    False, "garden: links, h2, the backlink, and the gate's name on the street"),
    (GD_LEAF,   GD_DAPPLE, False, "garden: the same, under the leaf shadow"),
    (GD_LEAF,   GD_BOARD,  False, "garden: a link inside a board or a spider panel"),
    (GD_BLOOM,  GD_DAY,    False, "garden: a link being hovered, and the one flower colour"),
    (GD_BLOOM,  GD_DAPPLE, False, "garden: the same, under the leaf shadow"),
    (GD_BLOOM,  GD_BOARD,  False, "garden: a hovered link on a board. It started at #C2470E, which "
                                  "measured 4.12 here -- the garden's brightest colour failing on "
                                  "its brightest surface, caught before it shipped"),
    (GD_BOARD,  GD_LEAF,   False, "garden: 'Ask the garden' -- the one solid button in the room"),
    (GD_BOARD,  GD_LOAM,   False, "garden: the same button while it is hovered"),
    # THE DRAWN LEAF IS HELD TO THE 3:1 GRAPHICS BAR, the Jungle Room's canopy
    # rule: a leaf nobody can pick out of the ground is not a leaf. It also
    # draws the rule down the side of each sown drill and the underline under a
    # label's name, neither of which carries a word.
    (GD_LEAF2,  GD_DAY,    True,  "garden: the lit face of every drawn leaf, and a drill's rule"),
    (GD_LEAF2,  GD_DAPPLE, True,  "garden: the same, under the leaf shadow"),
    (GD_LEAF2,  GD_BOARD,  True,  "garden: a drawn leaf over a board, and a label's underline"),
    # WHITE ON WHITE, CARRIED BY THE OUTLINE. A limewashed board is 1.07 against
    # the path and the ghost pipe in Queering.Earth's bed is the same white with
    # no green in it at all, which is the pebbling shore's reading of WCAG
    # 1.4.11 arriving in a plant: what has to separate is the EDGE, not the
    # fill. Every one of those shapes is drawn in GD_LOAM, and this is that
    # line against what it encloses.
    (GD_LOAM,   GD_BOARD,  True,  "garden: the outline round the ghost pipe, the cold frame's glass, "
                                  "every label and the quest marker -- the line that makes a white "
                                  "object visible on a white ground"),
    # A drawing's own soil. The rhizome, the mycelial threads and the seeds are
    # GD_LOAM lines on GD_LOAM2 earth at 1.78, which is interior shading inside
    # one object -- the Faery Yurt's two tones of ivy, in a bed. What carries the
    # soil itself is its edge against the path, which is the pair above it here.
    (GD_LOAM2,  GD_DAY,    True,  "garden: the turned earth in every bed's drawing, against the path"),
    # NOTHING GREEN IS EVER DRAWN ON THAT EARTH, and this file is why. The two
    # greens measured 1.38 and 2.14 against the soil, and NO BROWN CAN CLEAR 3:1
    # AGAINST BOTH AT ONCE, because they are only 1.55 apart from each other --
    # so there was no palette fix available and the drawings changed instead.
    # Above the soil line is green, below it is pale: a root, a rhizome, a
    # mycelial thread, a spilled seed and the underground half of a shoot, all in
    # the path's own colour, which is also what a blanched shoot actually looks
    # like before it reaches the light. make-garden.py walks every coordinate of
    # every green element and refuses one that crosses the line, because the next
    # drawing will be added by somebody who has not read this note.
    (GD_DAY,    GD_LOAM2,  True,  "garden: every root, rhizome, thread, seed and blanched shoot -- "
                                  "the palette splits at the soil line the way a plant does"),
    (GD_LOAM,   GD_DAPPLE, True,  "marker: the plant label's outline on the garden path"),

    # ── Danny the Street (§33) ──────────────────────────────────────────────
    # EVERY INK AGAINST BOTH GROUNDS, because the lamp lands where it lands and
    # the nameplate, the lede and the first bay are all standing in it. The
    # Jungle Room's rule about shafts of light, on a road.
    (DN_PAINT,  DN_TAR,  True,  "danny: the h1 on the nameplate in Overpass, 32-58px, and "
                                "every road legend over a bay"),
    (DN_PAINT,  DN_LIT,  True,  "danny: the same, where the lamp's pool reaches them"),
    (DN_PAINT,  DN_TAR,  False, "danny: the lede, every paragraph on the road, and every "
                                "bold run in one"),
    (DN_PAINT,  DN_LIT,  False, "danny: the same, under the lamp"),
    (DN_CHALK,  DN_TAR,  False, "danny: the topline note, every chalked aside, each source "
                                "line and the rights note"),
    (DN_CHALK,  DN_LIT,  False, "danny: the topline note under the lamp, which is the one "
                                "piece of fine print standing in it"),
    (DN_SODIUM, DN_TAR,  False, "danny: every link, the backlink, the line under the h1 "
                                "and each date in the running order"),
    (DN_SODIUM, DN_LIT,  False, "danny: the same, under the lamp"),
    # THE MARKER IS HELD TO THE BODY THRESHOLD, the Jungle Room's quills rule:
    # WCAG 1.4.3 does not reach a graphic, and a drain you cannot pick out of
    # the road is a control you cannot use. It is drawn in the chalk and lies on
    # the road, so the pair above decides it at 8.91.
    (DN_CHALK,  DN_TAR,  False, "danny: the job marker, a drain in the gutter"),

    # ── The Outskirts (§34) and Black Leather Lagoon (§35) ───────────────────
    # TWO GROUNDS EACH, and in both cases the second is a lit panel standing on
    # the first: out on the road it is the face of a board, and in the lagoon it
    # is a lobby card. Both are DARKER than the room, which is unusual here --
    # most panels on this street are lighter than what they sit on -- so the
    # panel is the harder ground and every ink is held against both.
    (OSK_BEAM,   OSK_NIGHT, False, "outskirts: the h1, every turning's name, the lede and "
                                   "every bold run on the road"),
    (OSK_BEAM,   OSK_BOARD, False, "outskirts: the same where they fall on a sign's face"),
    (OSK_DIM,    OSK_NIGHT, False, "outskirts: every paragraph, the topline note and the "
                                   "line under each turning"),
    (OSK_DIM,    OSK_BOARD, False, "outskirts: the verge notice and the foot of the road"),
    (OSK_RUST,   OSK_NIGHT, False, "outskirts: every link, the backlink, each section "
                                   "heading and each turning's number"),
    (OSK_RUST,   OSK_BOARD, False, "outskirts: the same on a sign's face, and the line "
                                   "under a turning that is named and not built"),
    # THE MARKER IS HELD TO THE BODY THRESHOLD, the Jungle Room's quills rule:
    # WCAG 1.4.3 does not reach a graphic, and a reflector you cannot pick out
    # of the verge is a control you cannot use. It is drawn in the beam and lies
    # on the road, so the first pair decides it at 16.13.
    (OSK_BEAM,   OSK_NIGHT, False, "outskirts: the job marker, a reflector in the verge"),

    (LAG_SCREEN, LAG_WATER, False, "lagoon: every heading on the water, the lede, the bill "
                                   "line under the h1 and the label on every press"),
    (LAG_SCREEN, LAG_CARD,  False, "lagoon: the same on a lobby card and on the screen's "
                                   "own panel"),
    (LAG_DIM,    LAG_WATER, False, "lagoon: the topline note, the line over the bill and "
                                   "every paragraph the room does not emphasise"),
    (LAG_DIM,    LAG_CARD,  False, "lagoon: each record's release, year and runtime, and "
                                   "the fine print inside the boxed sections"),
    (LAG_ACID,   LAG_WATER, False, "lagoon: the h1, every link, the backlink and each "
                                   "record's role line"),
    (LAG_ACID,   LAG_CARD,  False, "lagoon: the same on a card, and the bullet markers in "
                                   "the door policy"),
    (LAG_POSTER, LAG_WATER, False, "lagoon: the tagline under the bill and every section "
                                   "heading"),
    (LAG_POSTER, LAG_CARD,  False, "lagoon: the same inside the Napa panel, and the line "
                                   "naming whose song a cover is"),
    # THE RED THAT CARRIES TEXT AND THE RED THAT DOES NOT ARE TWO COLOURS ON
    # PURPOSE. LAG_BLOOD is the poster red this room actually wants -- it frames
    # the screen, posts the cards and rules the presses -- and it measures 3.35
    # and 3.05, under the bar both ways. LAG_POSTER exists so that the room is
    # never tempted to let the darker one say something, which is exactly the
    # shape of mistake the Playhouse made when a fill rule grew a second child.
    # LAG_BLOOD is in ORNAMENT with those numbers beside it.
    (LAG_ACID,   LAG_WATER, False, "lagoon: the job marker, a window speaker on a post"),

    # ── Sithen (§36) ─────────────────────────────────────────────────────────
    # TWO GROUNDS: the field under the moon, and the banked earth of every panel
    # and every rule. The bank is LIGHTER than the field by a little and darker
    # than anything else on the page, and it is the harder of the two, so every
    # ink is held against both.
    (STH_BONE,  STH_NIGHT, False, "sithen: the h1, every heading, the lede, each rule's "
                                  "own line and every bold run in the room"),
    (STH_BONE,  STH_BANK,  False, "sithen: the same on a panel of banked earth, and the "
                                  "first line of every documented fact"),
    (STH_DIM,   STH_NIGHT, False, "sithen: the topline note, the line over the h1 and "
                                  "every paragraph the room does not emphasise"),
    (STH_DIM,   STH_BANK,  False, "sithen: where each rule says which tradition it comes "
                                  "from, and the sources at the foot of the room"),
    (STH_MOON,  STH_NIGHT, False, "sithen: every link, the backlink and the line "
                                  "translating the room's own name"),
    (STH_MOON,  STH_BANK,  False, "sithen: the number beside each rule, and the label on "
                                  "the half of it that is ours"),
    # THE MARKER IS HELD TO THE BODY THRESHOLD, the Jungle Room's quills rule, and
    # it is drawn in the moon rather than in this room's thorn colour FOR that
    # rule: STH_THORN is 3.69 here and a sprig nobody can pick out of the dark is
    # a control nobody can use. The pair above decides it at 9.73.
    (STH_MOON,  STH_NIGHT, False, "sithen: the job marker, a sprig of thorn on the bank"),

    # ── Covenstead (§37) ─────────────────────────────────────────────────────
    # TEN PAIRS AND NO ORNAMENT ENTRY, still the only room here without one.
    # Every other room has at least one colour allowed to be faint because it
    # only draws something. All three glazes carry text -- the greeting sets its
    # three clauses in them, the contested flag is set in the blue, the rose
    # rules every quotation and is the knock on the street door -- so all three
    # are held to the body bar on both grounds.
    (COV_INK,   COV_WASH, False, "covenstead: the h1, every heading, the lede, each tenet's "
                                 "own line, every quotation, and the name on the street door"),
    (COV_INK,   COV_SUN,  False, "covenstead: the same where the window light falls, which "
                                 "is most of the room"),
    (COV_INK_2, COV_WASH, False, "covenstead: every paragraph, the topline note, the blurb "
                                 "on the street door and the line under the h1"),
    (COV_INK_2, COV_SUN,  False, "covenstead: where each tenet says whose it is, every "
                                 "quotation's cite, and the sources at the foot"),
    (COV_DELFT, COV_WASH, False, "covenstead: every link, the backlink and the first clause "
                                 "of the greeting"),
    (COV_DELFT, COV_SUN,  False, "covenstead: the same on a lit panel, and the label on a "
                                 "tenet the tradition argues about"),
    (COV_SAGE,  COV_WASH, False, "covenstead: the second clause of the greeting, set in a "
                                 "different glaze from the first"),
    (COV_SAGE,  COV_SUN,  False, "covenstead: the same on a lit panel, and the rule down the "
                                 "side of the door policy"),
    (COV_ROSE,  COV_WASH, False, "covenstead: the third clause of the greeting, the knock on "
                                 "the street door and the bullet markers"),
    (COV_ROSE,  COV_SUN,  False, "covenstead: the rule beside every quotation. THE THREE "
                                 "GLAZES ARE MEASURED SEPARATELY ON PURPOSE -- if the "
                                 "crockery is ever made to match, this room has lost its "
                                 "subject and kept its wallpaper"),
    # The job marker is drawn in the blue glaze and lies on the room's own wall,
    # so the pair above decides it at 5.72 -- over the body threshold a marker
    # is held to, which is the Jungle Room's quills rule.
    (COV_DELFT, COV_WASH, False, "covenstead: the job marker, a kettle on the hob"),

    # ── Looming Rocks Amphitheatre (§38) ─────────────────────────────────────
    # TWO GROUNDS: unlit stone, and a rock face with a flood on it. The floods
    # point UP, so a panel is a gradient that is lighter at the FOOT -- and the
    # flat colour under it is LR_FACE, the lighter end, because that is the
    # worse case for pale type standing on it. The Rabbit Hole's rule, and the
    # reason both ends are measured rather than the average.
    # BOTH ACCENTS CARRY TEXT, so this room has no ornament entry either.
    (LR_BONE,   LR_ROCK, False, "looming rocks: the h1, every heading, the lede, each act's "
                                "name and every bold run in the room"),
    (LR_BONE,   LR_FACE, False, "looming rocks: the same on a lit rock face, on the lighting "
                                "desk and inside every act on the bill"),
    (LR_DIM,    LR_ROCK, False, "looming rocks: the topline note, the line over the h1 and "
                                "every paragraph the room does not emphasise"),
    (LR_DIM,    LR_FACE, False, "looming rocks: each act's artist, channel and runtime, the "
                                "label on the desk, and the runtime beside the play control"),
    (LR_UV,     LR_ROCK, False, "looming rocks: every link, the backlink and the line that "
                                "says the stage is dark"),
    (LR_UV,     LR_FACE, False, "looming rocks: the same on a panel, and the act number on "
                                "every entry in the running order"),
    (LR_LICHEN, LR_ROCK, False, "looming rocks: the line under the h1, the bullet markers "
                                "and every hover state"),
    (LR_LICHEN, LR_FACE, False, "looming rocks: every control that puts something on the "
                                "stage, the open edge of the running order, and the rule "
                                "beside whichever act is on the desk"),
    # THE MARKER IS DRAWN IN THE LICHEN RATHER THAN THE LAMP'S OWN VIOLET. Both
    # clear the body threshold a marker is held to -- the Jungle Room's quills
    # rule -- and the brighter one is the thing you can actually pick out of a
    # dark room, which is the point of a marker.
    (LR_LICHEN, LR_ROCK, False, "looming rocks: the job marker, a flood lamp at the foot of "
                                "the rock"),



]

# THE HERMITAGE'S CHAIRS ARE IN THE LIST AGAIN, and the episode stays written
# down because the way it hid is the interesting part. This file held three
# hexes for those bean bags that the page has NEVER used -- lighter by a long
# way -- while the chairs take their colour inline out of data/hermitage.json,
# and three matching --bag-N properties sat dead in :root keeping the story
# plausible. So every run passed while the magenta measured 2.79 and the teal
# 3.38 against the 4.5 their copy needs. check-contrast-live.py found it by
# measuring what renders. Ryan's call, 2026-09-21: lighten the two, moving
# nothing but the lightness, so all three chairs sit together at 4.80 to 4.82
# rather than one of them jumping to 7.3. WHEN A COLOUR LIVES IN A DATA FILE,
# THE PAIR HAS TO COME FROM THE DATA FILE.

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
    "#6e6880": "sithen: the thorn trees and branches in the mound drawing, the rule under the half of each taboo that is ours, and the edge of every banked panel, 3.69 on the field and 3.30 on the bank. It is the one colour in that room that is supposed to be faint -- a thorn that measured 4.5 would be a painted line rather than a branch -- and it never carries a word. The room's own job marker is drawn in the moon rather than in this, because a marker is held to the body threshold and this would not clear it.",
    "#6e7358": "outskirts: the dead grass along the foot of the share card and the dashed post beside a turning that is named and not built, 4.04 on the road and 3.51 on a sign. It carried the topline note and the line under every turning until it was measured, and both were moved to the fine print's own colour; what is left draws weeds and dashes a post. Every word on that road is measured above against both grounds.",
    "#b6342f": "lagoon: the frame round the drive-in screen, the post under every lobby card and the border on every press, 3.35 on the water and 3.05 on a card. It is the poster red this room is actually built out of and it never says anything -- LAG_POSTER is the lighter one that carries text, and the two exist separately so that the room is never tempted to let this one speak.",
    "#6b665d": "danny: the kerbstones down both sides of the road, the joints between "
               "them, the dashes between entries in the running order, the drain and "
               "the manhole in the drawing, and the rule round the one quotation. 3.08 "
               "on the tar and 2.62 inside the lamp's pool. A kerb that measured 4.5 "
               "would be a painted line rather than a stone, and this is the one room "
               "on the street where the edge of the page is a physical object. Every "
               "word in the room is measured above against both grounds.",
    "#c9b693": "zibaldone: the fold down the left of every sheet and the hairline round "
               "a pasted leaf, 1.63 on the page and 1.46 on a leaf. The guild's hairline "
               "rule at 2.22 is the precedent and the argument is the same one: it "
               "carries no text and it is SUPPOSED to be faint, because a fold that "
               "measured 4.5 would be a printed bar rather than a crease. A leaf is "
               "carried by its own paper, its shadow and the tape across the top of it.",
    "#dfcda8": "zibaldone: gummed paper -- the strip of tape holding each leaf down and "
               "the rule beside a margin note, 1.29 on the page and 1.15 on a leaf. It "
               "is the palest thing in the room on purpose and it never carries a word "
               "there. On the DESK it carries the way back to the street, at 10.10, and "
               "that pair is measured above.",
    "#3a2e24": "zibaldone: the lighter grain of the walnut the book is lying on, 1.20 "
               "against the desk. Two tones of one surface, and nothing is ever set on "
               "it -- the desk's own two pieces of text are measured above against the "
               "darker tone, which is the harder of the two.",
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
    "#04070a": "feed: the hard dark line between the flaps in that room's DOOR "
               "awning on the street, 1.15 on a flap face. The one place in this room "
               "a flat seam still reads as a seam: a door awning is a picture of a "
               "board seen from across the street, and there are no letters on it.",
    "#0f1417": "feed: the lower leaf of every flap, a solid band across the foot of "
               "each row, 1.06 on the flap face above it. NOTHING IS SET ON IT, which "
               "is the whole reason it is down there: it began as a hairline through "
               "the middle of the letters -- what a real Solari flap does -- and read "
               "as a strikethrough on the share card, then as a strikethrough through "
               "the second line of every WRAPPED title on a phone, which is worse. A "
               "real board's rows are one line of fixed-width characters and cannot "
               "wrap; ours carry the titles people actually gave their pages. So there "
               "is no proportion of a row that is not inside somebody's sentence, and "
               "the leaf lives at the foot.",
    "#313a3f": "feed: the lit fold along the top of that leaf, 1.51 on the flap face "
               "and 1.60 on the leaf. The edge of a moving part, carrying no words.",
    "#9db183": "garden: the hairline round every limewashed board, label and panel in "
               "that room, 2.13 on the path, 2.27 on the board and 2.02 under the leaf "
               "shadow. It is the guild's printed rule's job in a garden -- structure you "
               "feel rather than read -- and it is what makes a board 1.07 lighter than "
               "the ground visible at all. Nothing is set in it.",
    "#4e5865": "rabbit hole: the ribs of the shaft in the drawing at the top of the room, "
               "and the hairline down the left of every step on the trail. 1.95 on the "
               "slate, 2.37 on a ledge, 2.68 on a deep ledge. It is the wall of a hole "
               "seen in the dark and nothing is set in it -- the trail's own words are "
               "RH_BRASS and RH_DIM, both measured above. Held deliberately low: a shaft "
               "you could read the sides of clearly would not be a shaft.",
    "#3a3026": "rabbit hole: the roots coming down into the hole at the near rim of the "
               "drawing, 1.44 against the dark inside the shaft they hang in. Ornament "
               "inside one <svg>, carrying no text, and the whole drawing has an "
               "aria-label describing it.",
    "#98a0a3": "foundry: the lead rule round every panel in the workshop, the hairline "
               "between the controls and the inks, and the edge of each specimen card. "
               "3.66 on the floor and 4.81 on a bench. It is the metal the room is built "
               "out of and nothing is ever set in it -- the room's own inks are bone, oil "
               "and brass, all measured above.",
    "#6e7a80": "foundry: the north light itself, which is a wash rather than a surface. "
               "1.52 against the floor at its strongest stop. It carries no text; what it "
               "composites the floor INTO is FO_LIT, and that is held as a ground above.",
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
