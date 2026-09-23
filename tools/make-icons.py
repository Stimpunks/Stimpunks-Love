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

The manifest's "icons" array is rewritten from the same list, so a file cannot
be rendered and not declared, or declared and not rendered.
"""
import json
import os
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


def render(chrome, tmp, size, fill, bleed, out):
    page = tmp / f"icon-{size}-{int(fill * 100)}-{int(bleed)}.html"
    edge = round(size * fill)
    page.write_text(
        "<!doctype html><html><head><style>"
        f"html,body{{margin:0;width:{size}px;height:{size}px;overflow:hidden;"
        f"background:{GROUND if bleed else 'transparent'}}}"
        f"img{{display:block;width:{edge}px;height:{edge}px;"
        f"margin:{(size - edge) // 2}px auto 0}}"
        f"</style></head><body><img src=\"{SVG.as_uri()}\"></body></html>")
    subprocess.run(
        [chrome, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         "--force-device-scale-factor=1", "--force-color-profile=srgb",
         "--default-background-color=00000000", f"--window-size={size},{size}",
         "--allow-file-access-from-files", f"--screenshot={out}", page.as_uri()],
        check=True, capture_output=True, timeout=120)
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

    declared = {i["src"].lstrip("/") for i in MANIFEST_ICONS}
    missing = [d for d in declared if not (ROOT / d).exists()]
    if missing:
        raise SystemExit(f"REFUSING: the manifest would declare {missing}, which were not rendered.")
    m = json.loads(MANIFEST.read_text())
    m["icons"] = MANIFEST_ICONS
    MANIFEST.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n")
    print(f"site.webmanifest: {len(MANIFEST_ICONS)} icons declared, every one on disk")
    return 0


if __name__ == "__main__":
    sys.exit(main())
