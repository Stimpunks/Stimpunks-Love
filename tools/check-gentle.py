#!/usr/bin/env python3
"""Check that Gentle still takes away the wobble, on every page, at every level.

THE DIAL IS THE ARGUMENT THIS SITE MAKES. Loudness is a thing the visitor holds
rather than a property of the page, and the site says so in its own copy:
"Gentle takes away the wobble, never the words." That is two claims, and until
this tool existed neither was checked by anything.

WHY A TOOL AND NOT CARE. The global part of the dial is safe: animation and
transition are killed at Gentle with !important in love.css section 3, and
nothing can out-specify !important by accident. The tilts are not. Every room
sets its own rotations and then resets them room by room, unprefixed, so the
reset is only ever one selector away from being outranked -- and CSS does not
warn. It applies the winner and says nothing.

It nearly happened the day this was written. A rule tilting alternate polaroids
on Enid's wall was first written

    .polaroid-wall .polaroid:nth-child(even)      (0,3,0)

against a reset of

    html[data-intensity="gentle"] .polaroid       (0,2,1)

The decoration outranked the dial. Regular and Gentle would have rendered the
same tilted wall, in the one room whose photographs are of real people who were
asked first -- and it would have shipped, because a screenshot at Regular looks
correct and nobody screenshots Gentle. It is written with :where() now, which
contributes no specificity. That fix is one line; noticing was the hard part,
and noticing is what this automates.

WHAT COUNTS AS WOBBLE. Not every transform is decoration. A mirrored vine is
scaleX(-1) and a positioned layer is a translate: those are layout, they carry
no motion, and flattening them would move furniture rather than calm anything.
Rotation and skew are the wobble. Both put non-zero numbers in the off-diagonal
terms of the computed matrix and nothing else does, so that is what this reads:
b and c from matrix(a,b,c,d,e,f). A page may rotate as much as it likes at
Regular and MAX; what it may not do is still be rotating at Gentle.

SVG INTERIORS ARE EXCLUDED, deliberately and narrowly: a transform on a <g>
inside a drawing is part of the drawing, the same kind of thing as a path's d
attribute. Helen's vines and crowns are built that way. Flattening those would
not produce a calmer page, it would produce a broken picture -- and a checker
that demanded it would be teaching people to add exceptions, which is how an
allowlist stops meaning anything. Anything outside an <svg> is in scope.

WHAT IT FOUND THE FIRST TIME IT RAN, which is the argument for having it: the
Faery Yurt's windowsill. A book at rotate(-3deg) and a pen at rotate(24deg),
both still tilted at Gentle, because section 14 shipped without a single
gentle rule in it. Twenty-four degrees is not subtle, the room is a day old,
two people read it, and nobody saw it. That is the failure mode exactly -- not
a thing anyone decided, a thing nobody was looking at.

THE OTHER HALF, "never the words", is checked too: the visible text of every
page must be identical at Gentle and at Regular. There is no content behind an
intensity level and none is to be added; a "lite" version that quietly dropped
a paragraph would be a worse site wearing a politer name. This passes today on
all fourteen pages, which is the point of writing it down now rather than after
somebody has something they would rather hide at the quiet setting.

A LOW-STIMULATION MODE IS GENTLE TOO, and its own promise is "same rooms, same
words". It lays the mode's ground on every box, and on 2026-10-24 that made the
Adventurer's Guild a blank page in every mode: the layer the fanfare throws its
sparks into is the whole window, see-through until then, and the mode filled it
in, over every word. So the probe also notes which positioned boxes and pseudo-
elements let the page through at Regular, puts a mode on, and walks every run of
text: anything above it that the mode filled in is a word the mode hid, and the
words in a mode must be the words at Regular. One mode is enough, because every
mode lays its ground the same way. The fix is never an exception for the room:
mark the layer aria-hidden, as decoration is, which takes no ground in a mode.

IF THIS REFUSES, add the missing reset. Do not add the element to an exception
list, do not lower the threshold, and above all do not reach for !important to
win the fight -- the next rule would need it too, and the one after that. The
reset belongs beside the rule that set the tilt, at a specificity that cannot
lose. :where() is how you scope one without raising it.
"""
import html as H
import atexit
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# The probe has to run inside the page, and the page's stylesheet, fonts and
# images are all relative -- so the copy it runs in lives beside the original
# rather than in a temp directory, where every one of those paths would miss.
# It is deleted in a finally; a leftover is swept at startup and would anyway
# be caught by make-sitemap.py, which refuses an HTML file it has no entry for.
PROBE = ROOT / ".check-gentle-probe.html"
# A Chrome profile of this tool's own, removed when it exits: check-all.sh runs
# this beside check-focus.py and check-contrast-live.py, and three headless Chromes
# must never share one.
PROFILE = tempfile.mkdtemp(prefix="check-gentle-chrome-")
atexit.register(shutil.rmtree, PROFILE, True)

CANDIDATES = [
    os.environ.get("CHECK_GENTLE_BROWSER"),
    os.environ.get("CHECK_PRINT_BROWSER"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome-stable"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]

# Rotation this small is a rounding artefact of the matrix, not a tilt anybody
# put there on purpose. sin(0.05 degrees) is about 0.0009.
FLAT = 0.001

JS = r"""
<script id="gentle-probe">
(function(){
  var d = document.documentElement, all = document.querySelectorAll('*');
  // b and c of matrix(a,b,c,d,e,f): non-zero only for rotation and skew.
  // A 3d matrix is reported as matrix3d and is read the same way at 4 and 1.
  function wobble(t){
    if (!t || t === 'none') return 0;
    var m = t.match(/matrix\(([^)]+)\)/);
    if (m) { var v = m[1].split(',').map(parseFloat); return Math.max(Math.abs(v[1]), Math.abs(v[2])); }
    m = t.match(/matrix3d\(([^)]+)\)/);
    if (m) { var w = m[1].split(',').map(parseFloat); return Math.max(Math.abs(w[1]), Math.abs(w[4])); }
    return 999;  // a transform this cannot read is reported rather than passed
  }
  function level(l){
    d.setAttribute('data-intensity', l);
    var rows = [];
    for (var i = 0; i < all.length; i++) {
      var s = getComputedStyle(all[i]);
      rows.push([wobble(s.transform), s.transform, s.animationName,
                 getComputedStyle(all[i], '::before').animationName,
                 getComputedStyle(all[i], '::after').animationName,
                 s.transitionDuration]);
    }
    return {rows: rows, text: document.body.innerText.replace(/\s+/g, ' ').trim()};
  }
  var where = [];
  for (var i = 0; i < all.length; i++) {
    var e = all[i], cls = e.getAttribute('class');
    where.push({
      tag: e.tagName.toLowerCase() + (cls ? '.' + cls.trim().split(/\s+/).join('.') : ''),
      svg: !!e.closest('svg')
    });
  }
  var res = {where: where};
  ['regular', 'max', 'gentle'].forEach(function(l){ res[l] = level(l); });

  // A LOW-STIMULATION MODE IS GENTLE, AND NEVER HIDES A WORD. Every box gets
  // the mode's ground, so a positioned layer that was see-through at Regular
  // can come out as a sheet over the words (the Adventurer's Guild went blank).
  // Note what each positioned box and pseudo-element lets through at Regular,
  // put a mode on, make everything hittable, and walk every run of text: a
  // layer above it that the mode filled in is a word the mode hid.
  function alpha(c){
    var m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return 1;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1;
  }
  function layer(e, p){
    var s = getComputedStyle(e, p);
    if (p && (s.content === 'none' || s.content === 'normal')) return null;
    if (s.position !== 'absolute' && s.position !== 'fixed') return null;
    return alpha(s.backgroundColor);
  }
  d.setAttribute('data-intensity', 'regular');
  var was = new Map();
  for (var i = 0; i < all.length; i++) {
    if (all[i].shadowRoot) continue;
    was.set(all[i], [layer(all[i], null), layer(all[i], '::before'), layer(all[i], '::after')]);
  }
  d.setAttribute('data-intensity', 'gentle');
  d.setAttribute('data-low', 'warm');
  var lowText = document.body.innerText.replace(/\s+/g, ' ').trim();
  var hit = document.createElement('style');
  hit.textContent = '*,*::before,*::after{pointer-events:auto!important}';
  document.head.appendChild(hit);
  function filled(e, k, p){
    var w = was.get(e); if (!w || w[k] === null || w[k] >= 1) return false;
    var now = layer(e, p); return now !== null && now >= 1;
  }
  function tag(e){ var c = e.getAttribute('class'); return e.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/).join('.') : ''); }
  var spots = [], tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (var n = tw.nextNode(); n; n = tw.nextNode()) {
    var t = n.parentElement;
    if (!n.nodeValue.trim() || !t || t.closest('script,style,noscript,svg,head')) continue;
    // checkVisibility, not visibility: a closed <details> still gives its
    // contents boxes where the summary is, and they are not on the screen.
    if (!t.checkVisibility({visibilityProperty: true})) continue;
    var rg = document.createRange(); rg.selectNodeContents(n);
    var r = rg.getClientRects()[0];
    if (!r || r.width < 2 || r.height < 2) continue;
    spots.push([t, r.left + scrollX + Math.min(r.width / 2, 8), r.top + scrollY + r.height / 2, n.nodeValue.trim().slice(0, 40)]);
  }
  spots.sort(function(a, b){ return a[2] - b[2]; });
  var hidden = [], vh = innerHeight, vw = innerWidth;
  spots.forEach(function(s){
    if (s[2] < scrollY || s[2] >= scrollY + vh - 1) window.scrollTo(0, Math.max(0, s[2] - vh / 3));
    var x = s[1] - scrollX, y = s[2] - scrollY;
    if (x < 0 || x >= vw || y < 0 || y >= vh) return;
    var stack = document.elementsFromPoint(x, y);
    for (var j = 0; j < stack.length; j++) {
      var e = stack[j];
      if (e === s[0] || s[0].contains(e)) break;      // reached the words
      var who = (!e.contains(s[0]) && filled(e, 0, null)) ? tag(e)
              : filled(e, 1, '::before') ? tag(e) + '::before'
              : filled(e, 2, '::after') ? tag(e) + '::after' : null;
      if (who) { hidden.push([who, s[3]]); break; }
    }
  });
  res.low = {text: lowText, hidden: hidden};
  var m = document.createElement('meta');
  m.id = 'gentle-result';
  m.setAttribute('content', JSON.stringify(res));
  document.head.appendChild(m);
})();
</script>
"""


def find_browser():
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    raise SystemExit(
        "REFUSING: no Chrome or Chromium found, so the dial cannot be checked.\n"
        "Looked in:\n  "
        + "\n  ".join(str(c) for c in CANDIDATES[2:] if c)
        + "\nPoint at a binary with CHECK_GENTLE_BROWSER=/path/to/chrome.\n"
        "Do not skip this: the claim is printed on every page either way."
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
            [browser, "--headless=new", "--disable-gpu", "--no-sandbox", f"--user-data-dir={PROFILE}",
             "--virtual-time-budget=4000", "--dump-dom", PROBE.as_uri()],
            capture_output=True, timeout=120,
        )
    finally:
        PROBE.unlink(missing_ok=True)
    m = re.search(r'<meta id="gentle-result" content="(.*?)">',
                  proc.stdout.decode("utf-8", "replace"), re.S)
    if not m:
        raise SystemExit(
            f"REFUSING: the probe did not report back for {page.name}. The page may\n"
            "have thrown before it ran. A page this cannot measure is a page whose\n"
            "dial is unverified, which is the same as a failure."
        )
    return json.loads(H.unescape(m.group(1)))


def main():
    browser = find_browser()
    PROBE.unlink(missing_ok=True)  # a stale one from an interrupted run
    # NEVER A DOTFILE: Python 3.9's glob("*.html") lists hidden files, and the
    # other two checkers check-all.sh runs beside this one each leave a
    # .check-...-probe.html in the root while they work. Listed, it is a page
    # that vanishes or carries somebody else's probe.
    pages = [p for p in sorted(ROOT.glob("*.html")) if not p.name.startswith(".")]
    if not pages:
        raise SystemExit("REFUSING: no pages found to check.")

    tilt_bad, quiet_bad, word_bad, low_bad, checked = [], [], [], [], 0

    for page in pages:
        res = probe(browser, page)
        where, gentle = res["where"], res["gentle"]["rows"]
        regular, mx = res["regular"]["rows"], res["max"]["rows"]
        checked += len(where)

        tilts, quiets = [], []
        for i, place in enumerate(where):
            loud = max(regular[i][0], mx[i][0])
            if not place["svg"] and loud > FLAT and gentle[i][0] > FLAT:
                tilts.append((place["tag"], gentle[i][1]))
            # the !important reset in section 3 should make these impossible;
            # if one shows up, that block has been edited or out-shouted
            if (gentle[i][2] != "none" or gentle[i][3] != "none"
                    or gentle[i][4] != "none"
                    or set(gentle[i][5].replace(" ", "").split(",")) - {"0s"}):
                quiets.append((place["tag"], gentle[i][2], gentle[i][5]))

        words = res["regular"]["text"] != res["gentle"]["text"]
        hidden = res["low"]["hidden"]
        low_words = res["regular"]["text"] != res["low"]["text"]
        ok = not (tilts or quiets or words or hidden or low_words)
        print(f"{'ok  ' if ok else 'FAIL'} {page.name:<24} {len(where):>4} elements"
              + ("" if ok else
                 f"   {len(tilts)} still tilted, {len(quiets)} still moving"
                 + (", words differ" if words else "")
                 + (f", {len(hidden)} runs of words hidden in a mode" if hidden else "")
                 + (", words differ in a mode" if low_words else "")))
        layers = {}
        for who, words_at in hidden:
            layers.setdefault(who, []).append(words_at)
        for who, at in list(layers.items())[:8]:
            print(f"       hidden in a mode under:   {who}  ({len(at)}, first {at[0]!r})")
        if hidden or low_words:
            low_bad.append(page.name)
        for tag, t in tilts[:8]:
            print(f"       still rotated at Gentle:  {tag}\n"
                  f"                                 {t}")
        for tag, a, d in quiets[:8]:
            print(f"       still animating at Gentle: {tag}  animation:{a} transition:{d}")
        if tilts:
            tilt_bad.append(page.name)
        if quiets:
            quiet_bad.append(page.name)
        if words:
            word_bad.append(page.name)
            print(f"       Gentle text is {len(res['gentle']['text'])} chars, "
                  f"Regular is {len(res['regular']['text'])}")

    print(f"\n{len(pages)} pages, {checked} elements, measured at Gentle, Regular and "
          f"MAX GLITTER and in a low-stimulation mode.\n{len(tilt_bad)} still tilting, "
          f"{len(quiet_bad)} still moving, {len(word_bad)} changing their words, "
          f"{len(low_bad)} hiding words in a mode.")

    if tilt_bad:
        print(
            "\nSomething rotates at Gentle. That is a room's decoration outranking the\n"
            "visitor's own setting, and it does not announce itself -- the page simply\n"
            "renders the louder rule. Add the reset next to the rule that set the tilt:\n\n"
            '    html[data-intensity="gentle"] .thing { transform: none; }\n\n'
            "and if the tilting selector needs scoping, scope it with :where() so it\n"
            "does not climb above that reset. Do not add an exception here."
        )
    if word_bad:
        print(
            "\nA page says something different at Gentle. There is no content behind an\n"
            "intensity level -- the dial takes away the wobble, never the words. Put it\n"
            "back; a quiet version that says less is not the quiet version."
        )
    if low_bad:
        print(
            "\nA low-stimulation mode hides words. Every box takes the mode's ground, so\n"
            "a layer a room lays over its words, see-through at Regular, comes out as\n"
            "a sheet. Decoration takes no ground in a mode: mark the layer\n"
            'aria-hidden="true", as decoration is, or make it a pseudo-element. Only\n'
            "decoration that covers something on purpose says data-low-cover. Do not\n"
            "give the mode an exception for the room."
        )
    sys.exit(1 if (tilt_bad or quiet_bad or word_bad or low_bad) else 0)


if __name__ == "__main__":
    main()
