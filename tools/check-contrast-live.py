#!/usr/bin/env python3
"""Measure the contrast of every piece of text on every page, as rendered.

check-contrast.py IS A LIST OF PAIRS SOMEBODY WROTE DOWN. THIS IS THE PAGE.
That difference is the whole reason this file exists, and it was written after
the list was blind twice in one day, in the same room, to two failures a person
found by looking:

  · THE PLAYHOUSE'S LINKS. `.room-play a` was yellow, which is right on that
    room's near-black boxes -- and every link on the page sits either on the
    blue ground or inside a WHITE card. 1.31 in the house rules, 3.88 on the
    quest marker's hand-in link, published since the street opened. The list
    holds a pair for every colour somebody DECIDED on, and an inherited colour
    was never decided, so there was nothing to hold a pair for.

  · THE ANSWER READOUTS. The pair was declared correctly -- cream on near-black
    -- and lost the cascade to `.toy--orange span`, which is (0,2,0) against
    `.toy__said` at (0,1,0) and was written back when a tile held one span. Four
    tiles rendered near-black on near-black at 1.00:1. The list cannot see a
    cascade; it does not know what applies, only what was intended.

Those are two different mistakes with one shape: THE COLOUR THAT RENDERS IS NOT
THE COLOUR THAT WAS WRITTEN DOWN. Nothing that reads a stylesheet as text can
catch either. check-gentle.py already renders every page to measure motion; this
does the same for colour, and the two tools are deliberately the same shape.

IT IS NOT A REPLACEMENT FOR check-contrast.py AND MUST NOT BECOME ONE. That file
is the record of what somebody looked at and decided, with the reasoning beside
each entry, and it holds the things this one cannot see:

  · AMBIENT COMPOSITES. The Chappell's rose window, the pony's mirrorball and
    the Arcade's scanline are fixed layers painted BEHIND the content, so the
    ground a reader actually sees is the room's colour with a glow over it. This
    walks the DOM for backgrounds and will report the flat colour, exactly as
    the list does by hand -- which is why the list holds those composites
    written out with their measurements.
  · ORNAMENT, which carries no text and so never appears here at all.
  · ANYTHING NO PAGE CURRENTLY RENDERS, including a colour added today for a
    room shipping tomorrow.

WHAT IT REVEALS BEFORE MEASURING, and why. Every `[hidden]` element is unhidden
and every `<details>` is opened, because the bug this was written for was in a
control that SHIPS HIDDEN and is revealed by a script on the first press -- a
load-time sweep would have walked straight past all four invisible boxes. A
revealed leaf with nothing in it gets a word put in it, since an element with no
text has no colour to measure. None of that is written back: the probe runs on a
throwaway copy of the page.

IF THIS REFUSES: fix the rule, and then work out why the pair list said the
colour was fine. The answer is usually that two files disagree about which rule
wins, and the page is the one telling the truth.
"""
import html as H
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Beside the original, not in a temp directory: the stylesheet, the fonts and
# the images are all relative. check-gentle.py's reason, and its cleanup.
PROBE = ROOT / ".check-contrast-probe.html"

CANDIDATES = [
    os.environ.get("CHECK_CONTRAST_BROWSER"),
    os.environ.get("CHECK_GENTLE_BROWSER"),
    os.environ.get("CHECK_PRINT_BROWSER"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome-stable"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]

JS = r"""
<script id="contrast-probe">
(function(){
  function parse(c){
    var m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1};
  }
  /* fg painted onto bg, which is what a translucent card on a room actually is */
  function over(fg, bg){
    var a = fg.a + bg.a * (1 - fg.a);
    if (!a) return {r: 0, g: 0, b: 0, a: 0};
    return {r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / a,
            g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / a,
            b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / a, a: a};
  }
  function lum(c){
    var v = [c.r, c.g, c.b].map(function(x){
      x = x / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function ratio(a, b){
    var la = lum(a), lb = lum(b), hi = Math.max(la, lb), lo = Math.min(la, lb);
    return (hi + 0.05) / (lo + 0.05);
  }
  /* Up the tree, stacking backgrounds until one of them is opaque. A fixed
     ambient layer BEHIND the content is not in this path and cannot be -- see
     the note at the head of the tool about what check-contrast.py still holds. */
  function ground(el){
    var acc = {r: 0, g: 0, b: 0, a: 0}, e = el;
    while (e) {
      var cs = getComputedStyle(e);
      /* A GRADIENT OR AN IMAGE IS A GROUND THIS CANNOT READ, and guessing is
         worse than declining: the Doomscroll's newsprint and The Den's shag are
         both painted with linear-gradients and no background-colour, so falling
         through to the body reported 222 pieces of pale text as near-black on
         near-black. Unmeasurable is a different answer from failing, and it is
         the honest one -- those grounds are written out by hand, with their
         measurements, in check-contrast.py. */
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      var bg = parse(cs.backgroundColor);
      if (bg && bg.a) { acc = over(acc, bg); if (acc.a >= 0.999) break; }
      e = e.parentElement;
    }
    if (acc.a < 0.999) acc = over(acc, {r: 255, g: 255, b: 255, a: 1});
    return acc;
  }

  /* Text put out of sight for everybody, as opposed to text put off to the side
     until it is focused -- the skip links are the second kind and are measured,
     because tabbing to one is exactly when somebody reads it. */
  function clipped(el){
    var cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (r.width <= 2 && r.height <= 2) return true;
    if (/rect\((0p?x?,? ?){3}0/.test(cs.clip || '')) return true;
    if (/inset\(\s*(50%|100%)/.test(cs.clipPath || '')) return true;
    return false;
  }

  /* The bug this exists for was in a control that ships hidden, so a load-time
     sweep would have walked straight past it. */
  var woke = 0;
  var hid = document.querySelectorAll('[hidden]');
  for (var h = 0; h < hid.length; h++) {
    hid[h].hidden = false;
    if (!hid[h].children.length && !hid[h].textContent.trim()) {
      hid[h].textContent = 'sample';
    }
    woke++;
  }
  var shut = document.querySelectorAll('details:not([open])');
  for (var d = 0; d < shut.length; d++) { shut[d].open = true; woke++; }

  function name(el){
    var c = el.getAttribute('class');
    return el.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/).join('.') : '');
  }

  var rows = [], seen = 0, skipped = 0;
  var all = document.querySelectorAll('body *');
  for (var i = 0; i < all.length; i++) {
    var el = all[i], own = '';
    for (var k = 0; k < el.childNodes.length; k++) {
      var n = el.childNodes[k];
      if (n.nodeType === 3) own += n.textContent;
    }
    if (!own.trim()) continue;

    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility !== 'visible') continue;
    var box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) continue;
    if (clipped(el)) continue;

    /* opacity multiplies down the tree; nothing at nearly zero is being read */
    var op = 1, e = el;
    while (e && e !== document.documentElement) { op *= parseFloat(getComputedStyle(e).opacity); e = e.parentElement; }
    if (op < 0.06) continue;

    var fg = parse(cs.color);
    if (!fg || fg.a < 0.06) continue;      /* ink nobody can see is another bug */
    /* Type filled by a background rather than by a colour: the colour is
       transparent on purpose and measuring it says nothing true. */
    if (String(cs.webkitBackgroundClip || cs.backgroundClip || '').indexOf('text') >= 0) continue;

    var bg = ground(el);
    if (!bg) { skipped++; continue; }
    if (fg.a < 1) fg = over(fg, bg);

    var px = parseFloat(cs.fontSize), w = parseInt(cs.fontWeight, 10) || 400;
    var large = px >= 24 || (px >= 18.66 && w >= 700);
    seen++;
    var cr = ratio(fg, bg);
    var need = large ? 3 : 4.5;
    if (cr < need - 0.005) {
      rows.push({tag: name(el), ratio: Math.round(cr * 100) / 100, need: need,
                 px: Math.round(px * 10) / 10, bold: w >= 700,
                 fg: cs.color, bg: 'rgb(' + [bg.r, bg.g, bg.b].map(Math.round).join(', ') + ')',
                 text: own.replace(/\s+/g, ' ').trim().slice(0, 44)});
    }
  }
  var m = document.createElement('meta');
  m.id = 'contrast-result';
  m.setAttribute('content', JSON.stringify({seen: seen, woke: woke, skipped: skipped, bad: rows}));
  document.head.appendChild(m);
})();
</script>
"""


def find_browser():
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    raise SystemExit(
        "REFUSING: no Chrome or Chromium found, so nothing can be rendered.\n"
        "Looked in:\n  "
        + "\n  ".join(str(c) for c in CANDIDATES[3:] if c)
        + "\nPoint at a binary with CHECK_CONTRAST_BROWSER=/path/to/chrome.\n"
        "Do not skip this: 'clashing is not the same as illegible' is printed on\n"
        "the site either way."
    )


def probe(browser, page: Path):
    src = page.read_text()
    if "</body>" not in src:
        raise SystemExit(f"REFUSING: {page.name} has no </body>, so the probe cannot run.")
    # ROOT-ABSOLUTE PATHS ARE RESOLVED AGAINST THE REPOSITORY, not the disk.
    # 404.html is served at whatever address somebody mistyped, so every path in
    # it starts with a slash -- and from a file:// probe "/love.css" is the root
    # of the filesystem, the page renders unstyled, and an unstyled page passes
    # everything. A checker that silently measures a different page from the
    # one that ships is the blind spot this tool exists to close. The probe sits
    # in ROOT, so dropping the leading slash points at the same file.
    src = re.sub(r'((?:href|src)=")/(?!/)', r"\1", src)
    PROBE.write_text(src.replace("</body>", JS + "</body>", 1))
    try:
        proc = subprocess.run(
            [browser, "--headless=new", "--disable-gpu", "--no-sandbox",
             "--virtual-time-budget=4000", "--dump-dom", PROBE.as_uri()],
            capture_output=True, timeout=120,
        )
    finally:
        PROBE.unlink(missing_ok=True)
    m = re.search(r'<meta id="contrast-result" content="(.*?)">',
                  proc.stdout.decode("utf-8", "replace"), re.S)
    if not m:
        raise SystemExit(
            f"REFUSING: the probe did not report back for {page.name}. The page may\n"
            "have thrown before it ran. A page this cannot measure is a page whose\n"
            "text is unmeasured, which is the same as a failure."
        )
    return json.loads(H.unescape(m.group(1)))


def main():
    browser = find_browser()
    PROBE.unlink(missing_ok=True)          # a stale one from an interrupted run
    pages = sorted(ROOT.glob("*.html"))
    if not pages:
        raise SystemExit("REFUSING: no pages found to check.")

    bad_pages, checked, revealed, failures, skipped = [], 0, 0, 0, 0

    for page in pages:
        res = probe(browser, page)
        checked += res["seen"]
        revealed += res["woke"]
        skipped += res.get("skipped", 0)
        bad = res["bad"]
        failures += len(bad)
        print(f"{'ok  ' if not bad else 'FAIL'} {page.name:<26} {res['seen']:>5} pieces of text"
              + ("" if not bad else f"   {len(bad)} under the bar"))
        for b in bad[:10]:
            print(f"       {b['ratio']:>5.2f} (needs {b['need']}) {b['px']}px"
                  f"{' bold' if b['bold'] else ''}  {b['fg']} on {b['bg']}")
            print(f"              {b['tag']}")
            print(f"              “{b['text']}”")
        if len(bad) > 10:
            print(f"       … and {len(bad) - 10} more")
        if bad:
            bad_pages.append(page.name)

    print(f"\n{len(pages)} pages rendered, {checked} pieces of text measured against the "
          f"ground each one\nactually sits on, {revealed} hidden or closed things opened first, "
          f"{skipped} standing on a\ngradient this cannot read and left to check-contrast.py. "
          f"{failures} under the bar on {len(bad_pages)} page(s).")

    if bad_pages:
        print(
            "\nSomething renders below the threshold. Fix the rule that is winning, not\n"
            "the pair in check-contrast.py — that file records what somebody decided,\n"
            "and a decision that never reaches the page is the thing being reported.\n"
            "If the colour looks right in the stylesheet, two rules disagree about\n"
            "which one applies and the page is the one telling the truth."
        )
    sys.exit(1 if bad_pages else 0)


if __name__ == "__main__":
    main()
