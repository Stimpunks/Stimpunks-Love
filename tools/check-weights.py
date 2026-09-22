#!/usr/bin/env python3
"""Refuse a weight The Foundry offers that renders the same drawings as another.

WHY THIS EXISTS, AND IT IS A CORRECTION RATHER THAN A PRECAUTION. The Foundry's
weight picker used to be built by grouping each family's variants by the sha256
of the file they point at, on the reasoning that a second name for one file is
not a second weight. That is true about the FILE and false about the LETTERS.
Most of these families are variable fonts: one file carries a weight axis, and
every @font-face declaration against it instances that axis. Identical bytes,
different outlines. So the rule threw away bolds that work -- measured out of
one file at 64px, Cinzel's 700 lays down 68% more ink than its 400, Work Sans
45%, Space Grotesk 41%, Nunito 39% -- and the room printed a line saying it
held only one weight for families the street sets at two.

Nothing caught it, because every part of the pipeline agreed with itself: the
puller hashed the bytes honestly, the builder grouped them honestly, and the
room described what the builder did. THE MEASUREMENT NOBODY TOOK WAS OF THE
LETTERS. This is the tool that takes it.

IT READS THE PUBLISHED HTML AND NEVER THE GENERATOR, which is check-quests.py's
rule. A checker that re-derived the offered weights by calling make-foundry.py
would only be testing that Python is deterministic; this exists for every moment
AFTER that tool runs, and for the hand-edit that lands in a committed file.

WHAT IT ASKS, ON THE PAGE:
  · every weight and italic the room offers is one love.css actually declares --
    an option for a weight with no @font-face behind it silently renders as the
    nearest one that does, which looks like a design choice
  · every weight and italic love.css declares is offered -- the half that catches
    the bug this was written for, where the street holds a bold and the room
    keeps it in a drawer. It also catches fonts/_sources.json drifting away from
    the stylesheet, which is how Nunito's 700 went unrecorded
  · no two things the room offers for one family come out the same drawings,
    measured by rendering them rather than by comparing bytes

HOW "THE SAME DRAWINGS" IS DECIDED. Each offering is drawn to a canvas at 64px
and two numbers are kept: the advance width of the sample, and the total ink in
it. Two offerings are the same only if BOTH match -- ADVANCE ALONE IS NOT
ENOUGH, and the street proves it: Courier Prime and Space Mono are monospaced,
so their 400 and 700 have the SAME advance to the hundredth of a pixel while the
bold lays down about 40% more ink. Ink alone is not enough either, since a slant
can preserve it. The thresholds are 1% of ink and half a pixel of advance, which
is far below every real difference on this street (the closest is an italic at
3.6%) and far above anti-aliasing noise.

IF THIS REFUSES: fix love.css or fonts/_sources.json and re-run
tools/pull-foundry.py and tools/make-foundry.py. Do not widen the thresholds,
and do not go back to comparing shas -- the sha is a fact about the file and
never was a fact about the drawings.
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
PAGE = ROOT / "foundry.html"

# Beside the original, because love.css and fonts/ are both relative to it.
# check-contrast-live.py's reason, and its cleanup.
PROBE = ROOT / ".check-weights-probe.html"

CANDIDATES = [
    os.environ.get("CHECK_WEIGHTS_BROWSER"),
    os.environ.get("CHECK_GENTLE_BROWSER"),
    os.environ.get("CHECK_CONTRAST_BROWSER"),
    os.environ.get("CHECK_PRINT_BROWSER"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome-stable"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]

# Wide enough that no family's sample is clipped, which would flatten two
# different weights into the same ink and pass them as one.
SAMPLE = "Handgloves 0123 mwi"
PX = 64
INK_TOLERANCE = 0.01          # 1% of the heavier of the pair
ADV_TOLERANCE = 0.5           # half a pixel

JS = """
<script id="weight-probe">
(async function(){
  var JOBS = __JOBS__;
  var out = [];
  var c = document.createElement('canvas');
  c.width = 2400; c.height = 140;
  var x = c.getContext('2d');

  /* @font-face IS LAZY: a page only downloads the faces it actually sets, so
     nothing here is loaded until it is asked for. The first draft measured
     straight away, and canvas answers for a font it has not got by silently
     drawing the fallback -- which would have made every face on the street
     measure identically and reported dozens of pairs as the same drawings.
     Ask for each one, then wait, and only then measure. */
  for (var i = 0; i < JOBS.length; i++) {
    var j = JOBS[i];
    j.font = (j.style === 'italic' ? 'italic ' : '') + j.weight + ' __PX__px "' + j.family + '"';
    try { await document.fonts.load(j.font, __SAMPLE__); } catch (e) {}
  }
  await document.fonts.ready;

  for (var i = 0; i < JOBS.length; i++) {
    var j = JOBS[i];
    x.fillStyle = '#fff'; x.fillRect(0, 0, 2400, 140);
    x.fillStyle = '#000'; x.font = j.font; x.textBaseline = 'top';
    var adv = x.measureText(__SAMPLE__).width;
    x.fillText(__SAMPLE__, 4, 16);
    var d = x.getImageData(0, 0, 2400, 140).data, ink = 0;
    for (var k = 0; k < d.length; k += 4) ink += 255 - d[k];
    out.push({family: j.family, weight: j.weight, style: j.style,
              adv: Math.round(adv * 100) / 100, ink: ink,
              /* still asked, because a face that failed to arrive measures as
                 the fallback and would compare equal to every other one */
              have: document.fonts.check(j.font)});
  }
  var m = document.createElement('meta');
  m.id = 'weight-result';
  m.setAttribute('content', JSON.stringify(out));
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
        "Point at a binary with CHECK_WEIGHTS_BROWSER=/path/to/chrome.\n"
        "Do not skip this: the room prints a claim about its own weights either way."
    )


def declared_in_css():
    """Family -> {(weight, style)}, read out of the stylesheet the browser obeys."""
    css = (ROOT / "love.css").read_text()
    out = {}
    for m in re.finditer(r"@font-face\s*\{([^}]*)\}", css):
        body = m.group(1)
        fam = re.search(r"font-family:\s*'([^']+)'", body)
        if not fam:
            continue
        weight = re.search(r"font-weight:\s*(\d+)", body)
        style = re.search(r"font-style:\s*(\w+)", body)
        out.setdefault(fam.group(1), set()).add(
            (int(weight.group(1)) if weight else 400,
             style.group(1) if style else "normal"))
    return out


def offered_in_room():
    """Family -> {(weight, style)}, read out of the published picker."""
    src = PAGE.read_text()
    out = {}
    for m in re.finditer(r"<option\b[^>]*\bdata-family=\"([^\"]+)\"[^>]*>", src):
        tag = m.group(0)
        fam = H.unescape(m.group(1))
        weights = re.search(r'data-weights="([^"]*)"', tag)
        italic = re.search(r'data-italic="([^"]*)"', tag)
        got = set()
        if weights and weights.group(1):
            got |= {(int(w), "normal") for w in weights.group(1).split(",") if w}
        if italic and italic.group(1):
            got.add((int(italic.group(1)), "italic"))
        out[fam] = got
    return out


def measure(browser, jobs):
    src = PAGE.read_text()
    if "</body>" not in src:
        raise SystemExit("REFUSING: foundry.html has no </body>, so the probe cannot run.")
    script = (JS.replace("__JOBS__", json.dumps(jobs))
                .replace("__PX__", str(PX))
                .replace("__SAMPLE__", json.dumps(SAMPLE)))
    PROBE.write_text(src.replace("</body>", script + "</body>", 1))
    try:
        proc = subprocess.run(
            [browser, "--headless=new", "--disable-gpu", "--no-sandbox",
             "--virtual-time-budget=8000", "--dump-dom", PROBE.as_uri()],
            capture_output=True, timeout=180,
        )
    finally:
        PROBE.unlink(missing_ok=True)
    m = re.search(r'<meta id="weight-result" content="(.*?)">',
                  proc.stdout.decode("utf-8", "replace"), re.S)
    if not m:
        raise SystemExit(
            "REFUSING: the probe did not report back. The page may have thrown\n"
            "before it ran, and an unmeasured picker is the same as a failing one."
        )
    return json.loads(H.unescape(m.group(1)))


def main():
    browser = find_browser()
    PROBE.unlink(missing_ok=True)

    css = declared_in_css()
    room = offered_in_room()
    if not room:
        print("REFUSING: no faces found in foundry.html's picker. If the room was\n"
              "rebuilt, point this at the new markup.", file=sys.stderr)
        return 1

    fail = []

    for fam in sorted(room):
        want = css.get(fam)
        if want is None:
            fail.append(f"{fam}: offered by the room and declared nowhere in love.css.")
            continue
        for w, st in sorted(room[fam] - want):
            fail.append(f"{fam}: the room offers {w} {st} and love.css declares no such "
                        f"face, so it renders as the nearest one that exists.")
        for w, st in sorted(want - room[fam]):
            fail.append(f"{fam}: love.css declares {w} {st} and the room does not offer "
                        f"it. The street holds a weight the bench is keeping in a drawer.")

    jobs = [{"family": f, "weight": w, "style": st}
            for f in sorted(room) for w, st in sorted(room[f])]
    rows = measure(browser, jobs)

    by_family = {}
    for r in rows:
        if not r["have"]:
            fail.append(f"{r['family']}: {r['weight']} {r['style']} did not load, so it "
                        f"could not be measured.")
            continue
        by_family.setdefault(r["family"], []).append(r)

    same = 0
    for fam, rs in sorted(by_family.items()):
        for i in range(len(rs)):
            for j in range(i + 1, len(rs)):
                a, b = rs[i], rs[j]
                heavier = max(a["ink"], b["ink"]) or 1
                d_ink = abs(a["ink"] - b["ink"]) / heavier
                d_adv = abs(a["adv"] - b["adv"])
                if d_ink < INK_TOLERANCE and d_adv < ADV_TOLERANCE:
                    same += 1
                    fail.append(
                        f"{fam}: {a['weight']} {a['style']} and {b['weight']} {b['style']} "
                        f"render the same drawings ({d_ink * 100:.2f}% ink apart, "
                        f"{d_adv:.2f}px advance apart). One of them is a control that "
                        f"does nothing.")

    if fail:
        print("REFUSING:\n  " + "\n  ".join(fail), file=sys.stderr)
        print("\nThe picker is what a visitor presses. Fix love.css or "
              "fonts/_sources.json,\nthen re-run tools/pull-foundry.py and "
              "tools/make-foundry.py. Do not widen the\nthresholds and do not go back "
              "to comparing shas.", file=sys.stderr)
        return 1

    files = len({(r["family"]) for r in rows})
    print(f"{len(rows)} weights and italics offered across {files} families, every one "
          f"declared in\nlove.css and every one rendering its own drawings. "
          f"{same} came out the same.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
