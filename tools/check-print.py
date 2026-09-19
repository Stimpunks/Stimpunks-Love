#!/usr/bin/env python3
"""Check that every page in the zine room still prints to one sheet.

The Zine Table says, in its own copy, that every page in it "prints to one sheet
on a bad office printer" and that "this page has a print stylesheet and it is not
a joke". That is a claim about a rendered artifact, so it cannot be checked by
reading CSS -- and it was false on the day the room shipped. Issue #1 printed to
three pages, because the two-column row wrapped at paper width and every link
expanded to its full URL after it. Nobody noticed, because nobody printed it.

So this renders each page through headless Chrome to a real PDF and counts the
sheets. That exercises the whole print path -- @page, the print stylesheet, the
self-hosted fonts' true metrics -- rather than approximating it. Adding a
paragraph to a room is enough to break this: it happened three times in one day.

WHICH PAGES: any page whose body carries class="room-zine", found by reading the
files rather than from a list here. The claim belongs to the room, so a page that
joins the room inherits it, and issue #3 is covered without editing this tool.

WHAT THIS DOES NOT CHECK: the other half of the same sentence, "in black and
white. If it needs colour to make sense, it does not go in the zine." Colour in
the output is not checked here. Do not read a pass as covering it.
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

CANDIDATES = [
    os.environ.get("CHECK_PRINT_BROWSER"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome-stable"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]


def find_browser():
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    raise SystemExit(
        "REFUSING: no Chrome or Chromium found, so the one-sheet claim cannot be\n"
        "checked. Looked in:\n  "
        + "\n  ".join(str(c) for c in CANDIDATES[1:] if c)
        + "\nPoint at a binary with CHECK_PRINT_BROWSER=/path/to/chrome, or install one.\n"
        "Do not simply skip this: the claim is printed on the page either way."
    )


def sheets_in(pdf: bytes) -> int:
    """Count pages in a Chrome-produced PDF without a PDF library."""
    n = len(re.findall(rb"/Type\s*/Page(?![s/\w])", pdf))
    if n:
        return n
    counts = [int(m) for m in re.findall(rb"/Count\s+(\d+)", pdf)]
    if counts:
        return max(counts)
    raise SystemExit("REFUSING: could not count pages in the rendered PDF.")


def main():
    browser = find_browser()
    pages = sorted(
        p for p in ROOT.glob("*.html")
        if re.search(r'<body[^>]*class="[^"]*\broom-zine\b', p.read_text())
    )
    if not pages:
        raise SystemExit(
            "REFUSING: no page carries class=\"room-zine\". Either the zine room was\n"
            "renamed and this tool was not, or it is gone. Both need a human."
        )

    fails = []
    with tempfile.TemporaryDirectory() as tmp:
        for page in pages:
            out = Path(tmp) / (page.stem + ".pdf")
            subprocess.run(
                [browser, "--headless=new", "--disable-gpu", "--no-sandbox",
                 # let the self-hosted faces load; their metrics decide the layout
                 "--virtual-time-budget=4000",
                 "--no-pdf-header-footer",
                 f"--print-to-pdf={out}", page.as_uri()],
                check=True, capture_output=True, timeout=120,
            )
            n = sheets_in(out.read_bytes())
            mark = "ok  " if n == 1 else "FAIL"
            print(f"{mark} {n} sheet{'s' if n != 1 else ' '}  {page.name}")
            if n != 1:
                fails.append((page.name, n))

    print(f"\n{len(pages)} zine page(s) rendered, {len(fails)} over one sheet.")
    if fails:
        print(
            "\nThe room's own copy says every page in it prints to one sheet. Cut "
            "something,\nor tighten the room's print rules in love.css section 13 -- "
            "do not edit the claim\nout of zine-table.html to make this pass."
        )
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
