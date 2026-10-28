#!/usr/bin/env python3
"""Render every icon the site ships from favicon.svg, and write the manifest's list.

ONE DRAWING, AND EVERYTHING ELSE IS RENDERED FROM IT. favicon.svg is the source;
favicon.ico, the Apple touch icon and the manifest's icons are pictures of it
taken by the same headless Chrome make-og.py uses, at each size directly rather
than scaled down from a big one, so the heart's stripes land on whole pixels
at 16px the way the drawing was designed to. A hand-exported PNG is a copy
that stops matching the first time anybody touches the SVG, and nothing would
say so.

WHY EACH ONE EXISTS, since each one is a file somebody will ask about:
  · favicon.ico, 16/32/48 -- browsers and crawlers request /favicon.ico at the
    root whatever the page's <link> says. Before this, every one of those
    requests got the 404 page. The ICO holds PNGs, which every browser since
    IE reads; the container is written here byte by byte, because it is six
    bytes of header and sixteen per image.
  · apple-touch-icon.png, 180 -- iOS does not use an SVG for a home screen.
    It is FULL-BLEED: the drawing's own rounded corners are transparent, iOS no
    longer fills transparency in, and a see-through corner on a home screen
    looks broken. iOS rounds it itself.
  · icon-192 and icon-512 -- the manifest's ordinary icons, the drawing as-is.
  · icon-maskable-512 -- for launchers that crop to a circle or a squircle. The
    ground is full-bleed and the heart is shrunk to sit inside the 80% safe
    zone, so no mask can clip it.
  · badge-96.png -- the small picture beside a CB notification in Android's
    status bar (cb-sw.js's `badge`). Android draws a badge from its
    transparency alone, in white, so icon-192 came out as a plain rounded
    square: its ground is opaque. This is the heart's own outline, read out of
    favicon.svg's clip path, in white on nothing. It is not in the manifest,
    because a badge is not an icon anybody installs.

The manifest's "icons" array is rewritten from the same list, so a file cannot
be rendered and not declared, or declared and not rendered.

TWO OTHER THINGS IN THE MANIFEST ARE HELD HERE, because this is the tool that
writes it (Ryan, 2026-10-20, when people began adding the street to their
Docks and Home Screens):
  · "id" is "/" and must stay "/". Before it was written down, Chrome worked it
    out from start_url, and "/" is what it got, so every install made before
    2026-10-20 is the same app. A different id is a different app: everybody's
    install would stop updating and a second one would be offered.
  · "display" is "minimal-ui", Ryan's call. A Mac's Add to Dock shows back and
    forward buttons only when the manifest is not "standalone", and a street of
    pages without a way back is a maze. iOS ignores minimal-ui, so an iPhone or
    iPad before iOS 26 saves the street as a Safari bookmark, with no
    notifications; from iOS 26 every site added to the Home Screen opens as a
    web app, and they work. The friendly edit is "standalone" so older iPhones
    get notifications; it takes the Dock's back button away.
  · "launch_handler" is {"client_mode": "navigate-new"} (2026-10-28, after a
    member found that following a street link from the radio during a call
    hung the call up in Chrome's installed app and not in Safari's). Chrome
    captures a window.open(url, '_blank') from inside an installed app into
    the app, and with no launch_handler it navigated the app's own window, the
    one the call was in. navigate-new gives the link a window of its own, as
    the radio means it to (cb.js, callUp), and does the same for a street link
    followed from outside the app, so that never lands on top of a call either.
    The friendly edits are "focus-existing" or "navigate-existing" so the app
    stays one window; each takes a call down.
"""
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
from pathlib import Path

import imgsize

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "favicon.svg"
MANIFEST = ROOT / "site.webmanifest"
GROUND = "#15121f"     # the drawing's own rounded rect, so full-bleed is seamless

# (file, size, fill: how much of the square the drawing takes, full-bleed ground?)
ICONS = [
    ("apple-touch-icon.png", 180, 1.00, True),
    ("icon-192.png",         192, 1.00, False),
    ("icon-512.png",         512, 1.00, False),
    ("icon-maskable-512.png", 512, 0.72, True),
]
ICO_SIZES = [16, 32, 48]
BADGE = ("badge-96.png", 96)
# The heart's box in favicon.svg is 7..57 across and 11..55 down; this square
# is centred on it with a little air, so the badge is the heart and no ground.
BADGE_VIEW = "4 5 56 56"
MANIFEST_HOLDS = {"id": "/", "display": "minimal-ui", "launch_handler": {"client_mode": "navigate-new"}}
MANIFEST_ICONS = [
    {"src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any"},
    {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
    {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
]

CANDIDATES = [
    os.environ.get("MAKE_OG_BROWSER"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome-stable"), shutil.which("chromium"), shutil.which("chrome"),
]


def browser():
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    raise SystemExit("REFUSING: no Chrome or Chromium found to render the icons with.\n"
                     "Point at one with MAKE_OG_BROWSER=/path/to/chrome.")


def heart(tmp):
    """The badge's drawing: favicon.svg's own heart, white on nothing."""
    m = re.search(r'<clipPath id="h">\s*<path d="([^"]+)"', SVG.read_text())
    if not m:
        raise SystemExit("REFUSING: favicon.svg has no heart (clipPath#h) to draw the badge from.")
    out = tmp / "badge.svg"
    out.write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{BADGE_VIEW}">'
                   f'<path d="{m.group(1)}" fill="#fff"/></svg>')
    return out


def render(chrome, tmp, size, fill, bleed, out, src=SVG):
    page = tmp / f"icon-{size}-{int(fill * 100)}-{int(bleed)}-{src.stem}.html"
    edge = round(size * fill)
    page.write_text(
        "<!doctype html><html><head><style>"
        f"html,body{{margin:0;width:{size}px;height:{size}px;overflow:hidden;"
        f"background:{GROUND if bleed else 'transparent'}}}"
        f"img{{display:block;width:{edge}px;height:{edge}px;"
        f"margin:{(size - edge) // 2}px auto 0}}"
        f"</style></head><body><img src=\"{src.as_uri()}\"></body></html>")
    cmd = [chrome, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
           "--force-device-scale-factor=1", "--force-color-profile=srgb",
           "--default-background-color=00000000", f"--window-size={size},{size}",
           "--allow-file-access-from-files", f"--screenshot={out}", page.as_uri()]
    # ONE RETRY, AND ONLY FOR A HANG. Headless Chrome now and then never returns
    # from a tiny screenshot: the first run of tools/check-all.sh, 2026-09-26,
    # stopped for two minutes on the 16px icon, and the same command alone took
    # eight seconds. A second hang is a real problem and still stops the run.
    for attempt in (1, 2):
        try:
            subprocess.run(cmd, check=True, capture_output=True, timeout=60)
            break
        except subprocess.TimeoutExpired:
            if attempt == 2:
                raise SystemExit(f"REFUSING: Chrome hung twice rendering {out.name}.")
            print(f"  (Chrome hung on {out.name}; trying once more)")
    got = imgsize.size(out)
    if got != (size, size):
        raise SystemExit(f"REFUSING: {out.name} came out {got[0]}x{got[1]}, not {size}x{size}.")


def ico(pngs):
    """An ICO container holding PNGs: a 6-byte header, a 16-byte entry each."""
    head = struct.pack("<HHH", 0, 1, len(pngs))
    offset = 6 + 16 * len(pngs)
    entries, blobs = b"", b""
    for size, data in pngs:
        s = 0 if size >= 256 else size
        entries += struct.pack("<BBBBHHII", s, s, 0, 0, 1, 32, len(data), offset)
        blobs += data
        offset += len(data)
    return head + entries + blobs


def main():
    if not SVG.exists():
        raise SystemExit("REFUSING: favicon.svg is the source of every icon and it is missing.")
    chrome = browser()
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        for name, size, fill, bleed in ICONS:
            render(chrome, tmp, size, fill, bleed, ROOT / name)
            print(f"  {name:<24} {size}x{size}")
        pngs = []
        for size in ICO_SIZES:
            out = tmp / f"ico-{size}.png"
            render(chrome, tmp, size, 1.0, False, out)
            pngs.append((size, out.read_bytes()))
        (ROOT / "favicon.ico").write_bytes(ico(pngs))
        print(f"  {'favicon.ico':<24} " + ", ".join(f"{s}x{s}" for s in ICO_SIZES))
        name, size = BADGE
        render(chrome, tmp, size, 1.0, False, ROOT / name, src=heart(tmp))
        print(f"  {name:<24} {size}x{size}")

    declared = {i["src"].lstrip("/") for i in MANIFEST_ICONS}
    missing = [d for d in declared if not (ROOT / d).exists()]
    if missing:
        raise SystemExit(f"REFUSING: the manifest would declare {missing}, which were not rendered.")
    m = json.loads(MANIFEST.read_text())
    wrong = {k: m.get(k) for k, v in MANIFEST_HOLDS.items() if m.get(k) != v}
    if wrong:
        raise SystemExit(f"REFUSING: site.webmanifest has {wrong}, and this tool holds "
                         f"{MANIFEST_HOLDS}. The docstring says why for each; the id never "
                         "changes, display is Ryan's call, and launch_handler keeps a call up in an "
                         "installed app.")
    sw = (ROOT / "cb-sw.js").read_text()
    if f"badge: '/{BADGE[0]}'" not in sw:
        raise SystemExit(f"REFUSING: cb-sw.js does not show /{BADGE[0]} as a notification's badge, "
                         "so Android would draw the badge from an opaque icon: a plain square.")
    m["icons"] = MANIFEST_ICONS
    MANIFEST.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n")
    print(f"site.webmanifest: {len(MANIFEST_ICONS)} icons declared, every one on disk")
    return 0


if __name__ == "__main__":
    sys.exit(main())
