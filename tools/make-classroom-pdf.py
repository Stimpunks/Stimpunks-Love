#!/usr/bin/env python3
"""The essay on the classroom's whiteboard, as a PDF.

Helen Edgar's ask, 2026-11-11: the blog that goes with Cavendish Primary
Classroom "as pdf file for people to scroll and read on interactive white board
in classroom", by Helen Edgar and Ryan Boren, November 2026.

THE PAGE IS THE ONLY COPY OF THE WORDS. The essay is the <article
class="cpc-essay"> on cavendish-primary-classroom.html, where it scrolls on the
whiteboard as real text. This tool lifts that article off the page, sets it in
the room's own two faces on white paper, and prints it with Chrome to
pdf/from-the-height-of-a-child.pdf. Nothing is typed here, so the PDF cannot
say something the page does not.

IT IS RUN BY HAND, AND IS NOT IN check-all.sh: it needs Chrome, and a PDF's
bytes carry the minute it was made, so a run every build would change the file
every build. Run it when the essay on the page changes:

    python3 tools/make-classroom-pdf.py

and commit the PDF with the page. With --check it only says whether the PDF is
older than the essay it was made from, by the essay's own hash, which a run
writes into data/classroom-pdf.json beside the PDF, and changes nothing.
"""
import hashlib
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "cavendish-primary-classroom.html"
OUT = ROOT / "pdf" / "from-the-height-of-a-child.pdf"
MADE = ROOT / "data" / "classroom-pdf.json"
ADDRESS = "https://stimpunks.world/cavendish-primary-classroom.html"

CHROMES = (
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "google-chrome", "chromium", "chromium-browser",
)


def chrome():
    for c in CHROMES:
        if Path(c).exists() or shutil.which(c):
            return c
    sys.exit("make-classroom-pdf: no Chrome found; it prints the PDF.")


def essay():
    page = PAGE.read_text(encoding="utf-8")
    m = re.search(r'<article class="cpc-essay">(.*?)</article>', page, re.S)
    if not m:
        sys.exit("make-classroom-pdf: no <article class=\"cpc-essay\"> on the classroom's page.")
    return m.group(1)


def mark(words):
    return hashlib.sha256(words.encode("utf-8")).hexdigest()[:16]


def sheet(words):
    title = re.search(r"<h3>(.*?)</h3>", words, re.S)
    if not title:
        sys.exit("make-classroom-pdf: the essay has no title.")
    # On paper the essay's title is the document's, and its parts come next.
    body = words.replace("<h3>", "<h1>").replace("</h3>", "</h1>")
    body = body.replace("<h4>", "<h2>").replace("</h4>", "</h2>")
    fonts = (ROOT / "fonts").as_uri()
    return f"""<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8">
<title>{re.sub(r"<[^>]+>", "", title.group(1))}</title>
<meta name="author" content="Helen Edgar and Ryan Boren">
<style>
@font-face {{ font-family: 'Andika'; font-weight: 400; src: url('{fonts}/andika-400.woff2') format('woff2'); }}
@font-face {{ font-family: 'Andika'; font-weight: 400; font-style: italic; src: url('{fonts}/andika-400-italic.woff2') format('woff2'); }}
@font-face {{ font-family: 'Andika'; font-weight: 700; src: url('{fonts}/andika-700.woff2') format('woff2'); }}
@font-face {{ font-family: 'Sniglet'; font-weight: 400; src: url('{fonts}/sniglet-400.woff2') format('woff2'); }}
@font-face {{ font-family: 'Sniglet'; font-weight: 800; src: url('{fonts}/sniglet-800.woff2') format('woff2'); }}
@page {{ size: A4; margin: 20mm 19mm 20mm; }}
html {{ color-scheme: light; }}
body {{ margin: 0; background: #fff; color: #22302E; font-family: 'Andika', sans-serif; font-size: 12.5pt; line-height: 1.55; font-synthesis: none; }}
h1 {{ font-family: 'Sniglet', sans-serif; font-weight: 800; color: #1E5A56; font-size: 25pt; line-height: 1.15; margin: 0 0 10pt; }}
h2 {{ font-family: 'Sniglet', sans-serif; font-weight: 400; color: #1E5A56; font-size: 16.5pt; line-height: 1.25; margin: 20pt 0 6pt; break-after: avoid; }}
p {{ margin: 0 0 9pt; orphans: 3; widows: 3; }}
.cpc-essay__by {{ font-weight: 700; margin-bottom: 4pt; }}
.cpc-essay__from {{ color: #4A5350; font-size: 11pt; }}
a {{ color: #9A3E1E; }}
table {{ width: 100%; border-collapse: collapse; margin: 10pt 0 12pt; break-inside: avoid; }}
th, td {{ text-align: left; vertical-align: top; padding: 5pt 6pt; border-bottom: 1.2pt solid #C9C2B4; font-size: 11pt; line-height: 1.4; }}
td:first-child {{ white-space: nowrap; }}
thead th {{ font-family: 'Sniglet', sans-serif; font-weight: 400; color: #1E5A56; font-size: 12pt; }}
ul {{ list-style: none; margin: 0; padding: 0; }}
li {{ font-size: 10.5pt; line-height: 1.45; margin: 0 0 7pt; padding-left: 1.6em; text-indent: -1.6em; overflow-wrap: anywhere; break-inside: avoid; }}
.from {{ margin-top: 18pt; padding-top: 9pt; border-top: 1.2pt solid #C9C2B4; font-size: 10.5pt; color: #4A5350; }}
</style></head><body>
{body}
<p class="from">From the interactive whiteboard in Cavendish Primary Classroom on Stimpunks.World, <a href="{ADDRESS}">{ADDRESS}</a>, where the classroom this essay is about can be walked round. Words by Helen Edgar and Ryan Boren, November 2026, under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Set in Andika (SIL International) and Sniglet (Haley Fiege), both under the SIL Open Font License.</p>
</body></html>
"""


def kept():
    """The essay's mark the PDF was made from, or None."""
    if not OUT.exists() or not MADE.exists():
        return None
    return json.loads(MADE.read_text(encoding="utf-8")).get("essay")


def main():
    words = essay()
    if "--check" in sys.argv:
        if kept() == mark(words):
            print("make-classroom-pdf: the PDF was made from the essay as it is on the page.")
            return
        sys.exit("make-classroom-pdf: the essay on the page has changed since the PDF was made. Run it without --check.")
    OUT.parent.mkdir(exist_ok=True)
    # Beside the page, so Chrome will load the faces off disk; a dotfile, so no
    # other tool takes it for a page; gone again whatever happens.
    probe = ROOT / ".classroom-pdf-probe.html"
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "essay.pdf"
        try:
            probe.write_text(sheet(words), encoding="utf-8")
            subprocess.run(
                [chrome(), "--headless=new", "--disable-gpu", "--no-sandbox",
                 "--virtual-time-budget=4000", "--no-pdf-header-footer",
                 f"--print-to-pdf={out}", probe.as_uri()],
                check=True, capture_output=True, timeout=180,
            )
        finally:
            probe.unlink(missing_ok=True)
        data = out.read_bytes()
    if not data.startswith(b"%PDF"):
        sys.exit("make-classroom-pdf: Chrome wrote something that is not a PDF.")
    pages = len(re.findall(rb"/Type\s*/Page\b", data))
    OUT.write_bytes(data)
    MADE.write_text(json.dumps({
        "_what": "Which essay pdf/from-the-height-of-a-child.pdf was printed from: a hash of the "
                 "<article class=\"cpc-essay\"> on cavendish-primary-classroom.html. "
                 "Written by tools/make-classroom-pdf.py; never by hand.",
        "essay": mark(words), "pages": pages}, indent=2) + "\n", encoding="utf-8")
    print(f"make-classroom-pdf: {OUT.relative_to(ROOT)}, {pages} pages, {len(data) // 1024} KB, "
          f"from the essay marked {mark(words)}.")


if __name__ == "__main__":
    main()
