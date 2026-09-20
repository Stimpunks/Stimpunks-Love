#!/usr/bin/env python3
"""Build the share card for every page, one visual world per room.

A link to this site gets unfurled into a card by whatever pasted it, and the
card is the only part of the street most people ever see. Left to a default,
that card is a grey rectangle with a favicon in it -- which for a site whose
entire argument is that the rooms refuse to share a look would be the blandest
possible misrepresentation of it.

SO THERE IS NO TEMPLATE. There are eight, one per room, and they are allowed to
contradict each other exactly as love.css sections 5 to 12 do. The street's card
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
reasonable, and it got its own.

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
body {{ display: flex; flex-direction: column; min-height: 0; }}
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
    var n = String(el.getAttribute('data-fit') || el.className ||
                   el.tagName.toLowerCase()).split(' ')[0];
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


# ── The eight cards ──────────────────────────────────────────────────────────
# One function per room. They are allowed to share nothing, and mostly do not.
# Each returns (ambient markup, card markup, alt text). `p` is the page.

def card_street(p):
    return (
        '<div class="sparkle" aria-hidden="true"></div>',
        f'<div class="og og--street" data-fit="card">'
        f'{p["h1"]}{p["tagline"]}'
        f'<p class="og-foot" data-fit="footer">ONE STREET · SIX ROOMS · YOU DECIDE HOW LOUD</p>'
        f'</div>',
        "A night-black card scattered with small coloured sparks. “stimpunks” in "
        "white block capitals with pink and cyan offset shadows, “.love” below it "
        "in hot pink script, and six taglines each set in a different typeface: "
        "Queer without fear. Interdependent and here. Divergent and proud. Living "
        "out loud. Plucky pluralism, for human organisms. Becoming and belonging, "
        "with ribald songing. Along the bottom: one street, six rooms, you decide "
        "how loud.",
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
            "other\nseven. Do not let it fall back to the plain one: the card is the "
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
    # down eleven times in the canonicals. Taking it from there rather than from
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

    # Two rooms build their card out of a list the page already holds. Lifted
    # whole rather than retyped, for the same reason the h1 is: a card that
    # repeats the page in its own words is a card that can come to disagree.
    lifted = {}
    for key, page, pat in (
        ("tagline",  "index.html",       r'(<ul class="tagline">.*?</ul>)'),
        ("stickers", "enids-room.html",  r'(<ul class="stickers">.*?</ul>)'),
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
