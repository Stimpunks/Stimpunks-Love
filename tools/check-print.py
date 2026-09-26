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

IT ALSO CHECKS THE OTHER HALF of the same sentence, "in black and white", by
reading the inks out of the PDF and refusing any that are not on the list below.
That half was false too. The print rules used to reset backgrounds on a LIST of
components, so every box not on the list kept its colour: the ransom note printed
in full yellow, cyan and red, and .pullquote plus the dark credit boxes kept a
near-black ground while the text on them was forced to #000 -- 1.14:1, invisible.
The most prominent quotation on each sheet and the whole attribution box were
lost that way, on the page that argues attribution is the cheapest thing you can
do.

An allowlist rather than a threshold, for the same reason check-contrast.py holds
named pairs: a new ink has to be looked at by a person. Adding a colour to the
room and finding it in the printed output is exactly the moment to decide whether
it survives the photocopier, and a tool that quietly tolerated it would be a tool
that let the claim rot again.

THE BROADSHEET BROADSIDE MAKES THE SAME KIND OF CLAIM AND GETS THE SAME CHECK.
Its articles say every broadside prints to exactly one sheet, side A then side
B, and that each sheet prints in its own two spot inks on white. So any page
whose body carries class="room-broadside" is rendered too, and must come out at
exactly two pages for every sheet in data/broadside.json -- a sheet whose
content overruns does not clip, it spills onto a third page, which is what the
Stimpunks broadside method found the hard way -- and its inks are held to the
sheet's own record: white, the ink, its two lighter greys, the hairline, and
the spot pairs the data file names. That room is the one place love.css's §63
lets a colour survive the print reset, which is exactly why the colour that
reaches the paper is read back out of the PDF rather than trusted.

WHAT IT STILL DOES NOT CHECK is text drawn on a ground it cannot be read against,
directly. Doing that from a PDF needs full graphics-state and transform tracking;
the attempt returned zero findings on pages that visibly had the bug, which is
worse than no check, so it is not here. The ink allowlist covers the cause rather
than the symptom: the grounds that made text invisible were themselves inks that
are no longer allowed.
"""
import os
import re
import shutil
import subprocess
import zlib
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


# Every ink the zine is allowed to print with, as PDF colour operands (0..1).
# Black is the text, white is the paper, and the two tinted near-neutrals are
# border colours the room already uses -- var(--ink) on solid boxes and #7a7264
# on dashed ones. Nothing else. If you add an ink to the room and it reaches the
# paper, decide on purpose whether it belongs and then put it here.
ALLOWED_INK = {
    (0.0, 0.0, 0.0):              "black - text",
    (1.0, 1.0, 1.0):              "white - paper",
    (0.0824, 0.0706, 0.1216):     "#15121f var(--ink) - solid borders",
    (0.4784, 0.4471, 0.3922):     "#7a7264 - dashed borders",
}
TOKEN = re.compile(rb"(-?(?:\d+\.?\d*|\.\d+))|([A-Za-z*'\"]+)")


def inks_in(pdf: bytes):
    """Every colour the PDF actually sets, from its content streams."""
    text = b""
    for chunk in re.findall(rb"stream\r?\n(.*?)endstream", pdf, re.S):
        try:
            text += zlib.decompress(chunk.strip(b"\r\n"))
        except zlib.error:
            pass  # not every stream is Flate, and the rest are not ink
    stack, used = [], set()
    for m in TOKEN.finditer(text):
        if m.group(1) is not None:
            stack.append(float(m.group(1)))
            continue
        op = m.group(2)
        n = 3 if op in (b"rg", b"RG") else 1 if op in (b"g", b"G") else 0
        if n and len(stack) >= n:
            vals = tuple(round(v, 4) for v in stack[-n:])
            # operands outside 0..1 are our tokenizer catching unrelated numbers
            if all(0.0 <= v <= 1.0 for v in vals):
                used.add(vals if n == 3 else (vals[0],) * 3)
        stack = []
    return used


def nearest_allowed(ink, tol=0.02):
    return any(all(abs(a - b) <= tol for a, b in zip(ink, ok)) for ok in ALLOWED_INK)


def describe(ink):
    r, g, b = (int(round(c * 255)) for c in ink)
    spread = max(ink) - min(ink)
    return f"#{r:02X}{g:02X}{b:02X}" + ("  (colour)" if spread > 0.12 else "  (grey)")


def sheets_in(pdf: bytes) -> int:
    """Count pages in a Chrome-produced PDF without a PDF library."""
    n = len(re.findall(rb"/Type\s*/Page(?![s/\w])", pdf))
    if n:
        return n
    counts = [int(m) for m in re.findall(rb"/Count\s+(\d+)", pdf)]
    if counts:
        return max(counts)
    raise SystemExit("REFUSING: could not count pages in the rendered PDF.")


def hex_ink(h):
    h = h.lstrip("#")
    return tuple(round(int(h[i:i + 2], 16) / 255, 4) for i in (0, 2, 4))


def render(browser, page, out):
    subprocess.run(
        [browser, "--headless=new", "--disable-gpu", "--no-sandbox",
         # let the self-hosted faces load; their metrics decide the layout
         "--virtual-time-budget=4000",
         "--no-pdf-header-footer",
         f"--print-to-pdf={out}", page.as_uri()],
        check=True, capture_output=True, timeout=120,
    )
    return out.read_bytes()


def broadside_check(browser):
    """The press's claim: two pages per sheet, and only the sheet's own inks.
    Returns the list of failures, printed as it goes."""
    import json
    pages = sorted(
        p for p in ROOT.glob("*.html")
        if re.search(r'<body[^>]*class="[^"]*\broom-broadside\b', p.read_text())
    )
    if not pages:
        return []
    sheets = json.loads((ROOT / "data/broadside.json").read_text())["sheets"]
    allowed = {
        (0.0, 0.0, 0.0): "black",
        (1.0, 1.0, 1.0): "white - paper",
        hex_ink("#002B36"): "--bb-ink",
        hex_ink("#073642"): "--bb-ink-2",
        hex_ink("#586E75"): "--bb-ink-3",
        hex_ink("#D8D2C4"): "--bb-rule - hairlines",
    }
    for sh in sheets:
        for ink in sh["spots"]:
            allowed[hex_ink(ink)] = f"{sh['id']} spot {ink}"
    ok_ink = lambda i: any(all(abs(a - b) <= 0.02 for a, b in zip(i, k)) for k in allowed)
    bad = []
    with tempfile.TemporaryDirectory() as tmp:
        for page in pages:
            pdf = render(browser, page, Path(tmp) / (page.stem + ".pdf"))
            n, want = sheets_in(pdf), 2 * len(sheets)
            stray = sorted(i for i in inks_in(pdf) if not ok_ink(i))
            good = n == want and not stray
            print(f"{'ok  ' if good else 'FAIL'} {n} pages for {len(sheets)} broadside"
                  f"{'s' if len(sheets) != 1 else ''} (want {want}), {len(stray)} stray "
                  f"ink{'s' if len(stray) != 1 else ''}  {page.name}")
            for i in stray:
                print(f"       {describe(i)}")
            if not good:
                bad.append(page.name)
            # AND AGAIN WITH SOMETHING ELSE IN THE DOCUMENT. The first version of
            # this room printed two clean pages here and two blank ones in Ryan's
            # browser, because he was signed on to the CB and its host is a block
            # at the foot of <body> -- and a browser extension's injected box is
            # the same shape. So the page is printed a second time with a stray
            # block at each end of <body>, from a copy beside it so every relative
            # path still resolves, and must come out the same.
            src = page.read_text()
            stray = ROOT / f"_print-stray-{page.name}"
            try:
                stray.write_text(src.replace(
                    '<body class="room-broadside"',
                    '<body class="room-broadside" data-stray', 1).replace(
                    'id="top">', 'id="top"><div style="height:40px">stray</div>', 1).replace(
                    '</body>', '<div class="cb-host" style="height:30px">stray</div></body>', 1))
                n2 = sheets_in(render(browser, stray, Path(tmp) / "stray.pdf"))
            finally:
                stray.unlink(missing_ok=True)
            print(f"{'ok  ' if n2 == want else 'FAIL'} {n2} pages with a stray box at each end "
                  f"of <body> (want {want})  {page.name}")
            if n2 != want:
                bad.append(page.name + " (with something else in the document)")
    if bad:
        print(
            "\nThe press says every broadside prints to one sheet, both sides, in its own\n"
            "two inks on white. Cut something from the side that ran over, or fix the\n"
            "print rules in love.css's §63 -- do not edit the claim off the page, and do\n"
            "not add an ink to this list without deciding it survives a photocopier.\n")
    return bad


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

    fails, inkbad = [], []
    broadside = broadside_check(browser)
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
            pdf = out.read_bytes()
            n = sheets_in(pdf)
            stray = sorted(i for i in inks_in(pdf) if not nearest_allowed(i))
            ok = (n == 1 and not stray)
            print(f"{'ok  ' if ok else 'FAIL'} {n} sheet{'s' if n != 1 else ' '} "
                  f"{len(stray)} stray ink{'s' if len(stray) != 1 else ' '}  {page.name}")
            for i in stray:
                print(f"       {describe(i)}")
            if n != 1:
                fails.append((page.name, n))
            if stray:
                inkbad.append((page.name, stray))

    print(f"\n{len(pages)} zine page(s) rendered, {len(fails)} over one sheet, "
          f"{len(inkbad)} printing ink that is not on the list.")
    if inkbad:
        print(
            "\nThe room says it prints in black and white. An ink that is not on\n"
            "ALLOWED_INK reached the paper, which means a background or a text colour\n"
            "survived the print reset in love.css's Print section. Check that the universal\n"
            "reset still covers it before deciding the ink belongs on the list --\n"
            "the last time this happened the grounds stayed dark, the text on them was\n"
            "forced black, and two whole boxes printed invisible."
        )
    if fails:
        print(
            "\nThe room's own copy says every page in it prints to one sheet. Cut "
            "something,\nor tighten the room's print rules in love.css's Print section -- "
            "do not edit the claim\nout of zine-table.html to make this pass."
        )
    sys.exit(1 if (fails or inkbad or broadside) else 0)


if __name__ == "__main__":
    main()
