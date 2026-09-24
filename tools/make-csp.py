#!/usr/bin/env python3
"""Compute the CSP hash for the one inline script on this site and write it into _headers.

Every page runs the same pre-paint snippet that applies the intensity dial's
default. It is byte-identical on every page, so ONE hash covers the site —
this script checks that claim rather than assuming it, because a stale hash does
not warn: the browser silently refuses the snippet and everyone who asked for
Gentle gets flashed the loud version instead. That is the exact failure the dial
exists to prevent, arriving through the security header.

frame-src IS READ OUT OF love-embed.js AND NOT WRITTEN HERE, and that is the
whole reason this paragraph exists. The origins used to be a string literal in
this file, which made FOUR places that had to agree while every comment on the
site said three — and the fourth was invisible, because the line it writes in
_headers says "do not hand-edit" and looks exactly like something you may edit.

  Swaying Sweetgrass added videopress.com to _headers by hand, confirmed it in
  the file, and shipped. Every later run of this tool quietly put the old list
  back. The room worked on the dev server, which serves no headers at all, and
  the live site refused the frame. Ryan found it by pressing the button.

So love-embed.js's ORIGINS array is now the single source of truth: the browser
gets what the script will actually try to build, derived rather than restated.
Adding a service means editing love-embed.js and re-running this. If the array
cannot be found or parsed this REFUSES rather than falling back to a default —
a silently narrowed frame-src is a room full of blank boxes, and a silently
widened one is a hole.
"""
import base64, hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
pages = sorted(ROOT.glob("*.html"))
snippets = set()
for p in pages:
    for m in re.finditer(r"<script>(.*?)</script>", p.read_text(), re.S):
        snippets.add(m.group(1))

if len(snippets) != 1:
    print(f"REFUSING: expected 1 distinct inline script, found {len(snippets)}.")
    print("Either the snippet drifted between pages or a new inline script appeared.")
    print("Fix the pages, or teach this tool to emit several hashes — do not add 'unsafe-inline'.")
    sys.exit(2)

snippet = snippets.pop()
digest = base64.b64encode(hashlib.sha256(snippet.encode()).digest()).decode()

# THE ORIGINS THE SCRIPT WILL ACTUALLY BUILD A FRAME FOR. Read, not restated.
embed = (ROOT / "love-embed.js").read_text()
block = re.search(r"var ORIGINS = \[(.*?)\];", embed, re.S)
if not block:
    print("REFUSING: love-embed.js has no ORIGINS array to read frame-src from.")
    print("That array is the single source of truth for which origins this site")
    print("will frame. Restating the list here is what let _headers and the script")
    print("drift apart once already -- fix the array, do not hard-code the list.")
    sys.exit(2)
found = re.findall(r"'(https://[^']+)'", block.group(1))
if not found:
    print("REFUSING: love-embed.js's ORIGINS array parsed to nothing.")
    print("A silently narrowed frame-src is a room full of blank boxes.")
    sys.exit(2)
# The array holds trailing slashes because it is used with indexOf(); a CSP
# source expression does not want one.
origins = " ".join(o.rstrip("/") for o in found)

# THE ORIGINS THE SCRIPT WILL ACTUALLY PLAY AUDIO FROM, read the same way and for
# the same reason. Kept WITH their path, because a CSP source expression may
# carry one and a path is tighter than a host: this lets the browser fetch the
# band's uploads and nothing else on that site. Without a media-src the policy
# falls back to default-src 'self' and The Small Hours' jukebox is a row of
# buttons that press and play nothing -- which, like a stale script hash, the
# browser does silently.
ablock = re.search(r"var AUDIO_ORIGINS = \[(.*?)\];", embed, re.S)
if not ablock:
    print("REFUSING: love-embed.js has no AUDIO_ORIGINS array to read media-src from.")
    sys.exit(2)
afound = re.findall(r"'(https://[^']+)'", ablock.group(1))
if not afound:
    print("REFUSING: love-embed.js's AUDIO_ORIGINS array parsed to nothing.")
    sys.exit(2)
media = " ".join(afound)
csp = (
    "default-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'; "
    # frame-ancestors is 'self' and NOT 'none', which is a deliberate loosening
    # and the only one in this policy. The laptop in the Solarpunk Hermitage's
    # cave frames stimpunks.world inside stimpunks.world, and 'none' forbids this
    # site being framed by ANYBODY -- itself included. 'self' keeps every other
    # origin out, so clickjacking protection against third parties is unchanged;
    # what it permits is exactly one page of ours embedding another page of ours.
    # X-Frame-Options above it is SAMEORIGIN for the same reason, since it has no
    # 'none' that means anything different.
    "frame-ancestors 'self'; img-src 'self'; font-src 'self'; "
    # connect-src is 'self' and NOT 'none', and that is the second loosening in
    # this policy. The CB (cb.js, netlify/functions/cb-*) is the one thing on the
    # site that sends anything: its radio asks this site's own /cb/ endpoints
    # for the channel while it is open. 'self' lets a page fetch from
    # stimpunks.world and nowhere else, so no page can send anything to anybody
    # but us -- which is the sentence privacy.html now prints. Ryan's call,
    # 2026-09-24. Do not widen it past 'self': a realtime service somewhere else
    # would be a third party every signed-on visitor talked to on every page.
    "connect-src 'self'; "
    # Every third-party origin here is read off love-embed.js above, so the
    # browser is told exactly what the script will try to build. 'self' is not
    # in that array and is added here: it is the laptop in the Hermitage's cave
    # framing this site inside itself, which love-embed.js never constructs.
    f"frame-src 'self' {origins}; "
    # 'self' for the recordings this site does serve (the audio room, the
    # Playhouse's yells, the yurt), then whatever AUDIO_ORIGINS holds.
    f"media-src 'self' {media}; "
    "style-src 'self' 'unsafe-inline'; "
    f"script-src 'self' 'sha256-{digest}'; "
    # A SAFETY NET, NOT A FIX. Every subresource here is already https or
    # same-origin, and HSTS keeps the page itself on https. This makes the
    # browser rewrite any http:// subresource somebody pastes into a room
    # later -- a credit's image, a scan -- instead of blocking it as mixed
    # content and leaving a hole in the page nobody notices. The spec's
    # recommendation; it loosens nothing.
    "upgrade-insecure-requests"
)
hdr = ROOT / "_headers"
src = hdr.read_text()
new = re.sub(r"(# >>> csp.*?\n)  Content-Security-Policy: [^\n]*",
             lambda m: m.group(1) + "  Content-Security-Policy: " + csp, src, flags=re.S)
hdr.write_text(new)
print(f"csp: sha256-{digest}  ({len(pages)} pages, 1 snippet)\n     frame-src 'self' " + origins + "  (read from love-embed.js)"
      + "\n     media-src 'self' " + media + "  (read from love-embed.js)")
