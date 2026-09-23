#!/usr/bin/env python3
"""Focus every control on every page, as rendered, and measure the ring.

THE RING IS A COLOUR THAT RENDERS, AND NOTHING HERE HAD EVER MEASURED IT. §2
sets one focus ring for the whole street -- 4px of yellow, 3px out -- which was
chosen for a street that is near-black, and it is right there. Then the street
grew pale rooms: manila, limewash, newsprint, a lit plaster wall, midday under
leaves, fog. On a pale ground that yellow is very nearly the ground (1.09 on
the fog, which is how this was found), so a keyboard user tabbing through one
of those rooms is moving an indicator nobody can see. check-contrast.py holds
pairs for text somebody decided on; check-contrast-live.py walks text nodes; a
ring is neither, so both passed while it failed.

THE BAR IS 3:1 AGAINST THE GROUND THE RING IS DRAWN ON. That is WCAG's
threshold for the parts of a control you need in order to use it (1.4.11), and
a focus indicator is exactly that. The ground is what is OUTSIDE the control
when the ring stands out from it -- the control's own fill is not under a ring
drawn 3px beyond its edge -- and what is inside it when the offset is negative.

WHAT IT DOES: unhides what ships hidden and opens every <details>, as
check-contrast-live.py does and for the same reason, then calls
focus({focusVisible: true}) on every control that is visible and reads the
outline the browser actually resolved. check-gentle.py and
check-contrast-live.py are the same shape and this is the third of them.

WHAT IT DECLINES. A ring standing on a gradient is unmeasurable, exactly as in
check-contrast-live.py -- guessing is worse than saying so. And a control whose
focus style is NOT an outline (a room that draws its own, with a border or a
box-shadow) is reported separately rather than failed, because this reads an
outline and should not claim to understand a drawing.

IF THIS REFUSES: set the ring at the room, beside the room's own link colour,
the way the fog does in §39. Do not change §2's yellow -- it is right on the
dark street, which is most of the street.
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
PROBE = ROOT / ".check-focus-probe.html"
NEED = 3.0
VERBOSE = "-v" in sys.argv

CANDIDATES = [
    os.environ.get("CHECK_FOCUS_BROWSER"),
    os.environ.get("CHECK_CONTRAST_BROWSER"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome-stable"),
    shutil.which("chromium"),
    shutil.which("chrome"),
]

JS = r"""
<script id="focus-probe">
(function(){
  function parse(c){
    var m = String(c).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(',').map(parseFloat);
    return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1};
  }
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
  /* EVERY COLOUR THE RING MIGHT BE STANDING ON, as a list. Flat grounds are
     check-contrast-live.py's ground(): stack backgrounds up the tree until one
     is opaque. A GRADIENT IS MEASURED AT EVERY STOP, each composited over what
     is under it, and the ring has to clear the worst of them -- which is a
     measurement of the worst case rather than a guess at where the ring lands,
     so it can be stricter than the page and never kinder. An image (url()) is
     still declined: there is no stop list to read. */
  var owner = null;       /* which element's background the ring stands on */
  /* A background-image is a list of layers, the FIRST painted on top. Split
     at the commas that are not inside a function. */
  function layersOf(img){
    var out = [], depth = 0, cur = '';
    for (var i = 0; i < img.length; i++) {
      var ch = img[i];
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) { out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out;
  }
  function stops(layer){
    var out = [], re = /rgba?\([^)]+\)/g, m;
    while ((m = re.exec(layer))) { var c = parse(m[0]); if (c) out.push(c); }
    return out;
  }
  function grounds(el){
    var layers = [], e = el;
    owner = null;
    function finish(list){
      return list.map(function(c){
        for (var i = layers.length - 1; i >= 0; i--) c = over(layers[i], c);
        return c;
      });
    }
    while (e) {
      var cs = getComputedStyle(e);
      var img = cs.backgroundImage;
      var bg = parse(cs.backgroundColor);
      if (img && img !== 'none') {
        if (/url\(/.test(img)) { owner = e; return null; }
        var here = e, below;
        if (bg && bg.a >= 0.999) below = [bg];
        else {
          var saved = layers; layers = [];
          below = grounds(e.parentElement) || [{r: 255, g: 255, b: 255, a: 1}];
          layers = saved;
          if (bg && bg.a) below = below.map(function(b){ return over(bg, b); });
        }
        /* Paint bottom-up: every stop of the lowest layer over what is under
           the element, then every stop of the next layer over each of those.
           What is under the element only survives where a stop is
           transparent -- an opaque gradient covers it, and the first draft of
           this counted the dark room behind the Latibulum's plaster as a ground
           the ring might stand on. */
        var all = below, ls = layersOf(img);
        for (var li = ls.length - 1; li >= 0; li--) {
          var st = stops(ls[li]);
          if (!st.length) continue;
          var next = [];
          all.forEach(function(b){ st.forEach(function(c){ next.push(over(c, b)); }); });
          all = next;
        }
        owner = here;
        return finish(all);
      }
      if (bg && bg.a) {
        if (bg.a >= 0.999) { owner = e; return finish([bg]); }
        layers.push(bg);
      }
      e = e.parentElement;
    }
    return finish([{r: 255, g: 255, b: 255, a: 1}]);
  }
  function name(el){
    var c = el.getAttribute('class');
    return el.tagName.toLowerCase() + (c ? '.' + c.trim().split(/\s+/).join('.') : '');
  }
  function hex(c){
    return '#' + [c.r, c.g, c.b].map(function(x){
      return ('0' + Math.round(x).toString(16)).slice(-2); }).join('');
  }

  var hid = document.querySelectorAll('[hidden]');
  for (var h = 0; h < hid.length; h++) hid[h].hidden = false;
  var shut = document.querySelectorAll('details:not([open])');
  for (var d = 0; d < shut.length; d++) shut[d].open = true;

  var sel = 'a[href], button, summary, input:not([type=hidden]), select, textarea, [tabindex]';
  var all = document.querySelectorAll(sel);
  var seen = 0, skipped = 0, graded = 0, bad = [], other = [], gradients = [];
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    if (el.getAttribute('tabindex') === '-1' || el.disabled) continue;
    el.focus({focusVisible: true});
    if (document.activeElement !== el) continue;       /* not focusable after all */
    var cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (cs.visibility !== 'visible' || r.width < 1 || r.height < 1) continue;
    var text = (el.getAttribute('aria-label') || el.textContent || el.value || '')
                 .replace(/\s+/g, ' ').trim().slice(0, 40);
    if (cs.outlineStyle === 'none' || parseFloat(cs.outlineWidth) === 0) {
      other.push({tag: name(el), text: text,
                  shadow: cs.boxShadow !== 'none', border: cs.borderStyle !== 'none'});
      el.blur(); continue;
    }
    var ring = parse(cs.outlineColor);
    var inside = parseFloat(cs.outlineOffset) < 0;
    var gs = grounds(inside ? el : (el.parentElement || el));
    el.blur();
    if (!gs || !ring) { skipped++; gradients.push(owner ? name(owner) : '?'); continue; }
    seen++;
    var cr = Infinity, bg = gs[0];
    gs.forEach(function(g){
      var rg = ring.a < 1 ? over(ring, g) : ring, v = ratio(rg, g);
      if (v < cr) { cr = v; bg = g; }
    });
    if (gs.length > 1) graded++;
    if (cr < NEED - 0.005) {
      bad.push({tag: name(el), text: text, ratio: Math.round(cr * 100) / 100,
                ring: hex(ring), bg: hex(bg), on: owner ? name(owner) : '?'});
    }
  }
  var m = document.createElement('meta');
  m.id = 'focus-result';
  m.setAttribute('content', JSON.stringify({seen: seen, skipped: skipped, graded: graded, bad: bad, other: other, gradients: gradients}));
  document.head.appendChild(m);
})();
</script>
""".replace("NEED - 0.005", f"{NEED} - 0.005")


def find_browser():
    for c in CANDIDATES:
        if c and Path(c).exists():
            return c
    raise SystemExit(
        "REFUSING: no Chrome or Chromium found, so nothing can be focused.\n"
        "Point at a binary with CHECK_FOCUS_BROWSER=/path/to/chrome."
    )


def probe(browser, page: Path):
    src = page.read_text()
    if "</body>" not in src:
        raise SystemExit(f"REFUSING: {page.name} has no </body>, so the probe cannot run.")
    # Root-absolute paths against the repository, for check-contrast-live.py's
    # reason: from file:// "/love.css" is the root of the disk, and an unstyled
    # 404 would be measured against the browser's default ring instead of ours.
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
    m = re.search(r'<meta id="focus-result" content="(.*?)">',
                  proc.stdout.decode("utf-8", "replace"), re.S)
    if not m:
        raise SystemExit(
            f"REFUSING: the probe did not report back for {page.name}. A page this\n"
            "cannot focus is a page whose rings are unmeasured, which is a failure."
        )
    return json.loads(H.unescape(m.group(1)))


def main():
    browser = find_browser()
    PROBE.unlink(missing_ok=True)
    only = {a for a in sys.argv[1:] if not a.startswith("-")}
    pages = [p for p in sorted(ROOT.glob("*.html")) if not only or p.name in only]
    if not pages:
        raise SystemExit("REFUSING: no pages found to check.")

    bad_pages, seen, skipped, failures, others = [], 0, 0, 0, 0
    for page in pages:
        res = probe(browser, page)
        seen += res["seen"]
        skipped += res["skipped"]
        bad = res["bad"]
        failures += len(bad)
        others += len(res["other"])
        print(f"{'ok  ' if not bad else 'FAIL'} {page.name:<26} {res['seen']:>4} rings"
              + ("" if not bad else f"   {len(bad)} under {NEED}")
              + (f"   {res['graded']} on a gradient, at its worst stop" if res["graded"] else "")
              + (f"   {res['skipped']} on an image" if res["skipped"] else "")
              + (f"   ({len(res['other'])} drawn another way)" if res["other"] else ""))
        # Group by ring-on-ground so one wrong rule reads as one line, not forty.
        groups = {}
        for b in bad:
            groups.setdefault((b["ring"], b["bg"], b["ratio"], b["on"]), []).append(b)
        for (ring, bg, cr, on), items in sorted(groups.items(), key=lambda kv: kv[0][2]):
            tags = sorted({i["tag"] for i in items})
            print(f"       {cr:>5.2f}  ring {ring} on {bg} ({on[:48]})  x{len(items)}  "
                  + ", ".join(tags[:3]) + (" …" if len(tags) > 3 else ""))
        if VERBOSE and res.get("gradients"):
            from collections import Counter
            for g, n in Counter(res["gradients"]).most_common(4):
                print(f"       gradient under {n}: {g[:70]}")
        for o in res["other"][:3]:
            print(f"       no outline: {o['tag']}  “{o['text']}”"
                  f"{'  (box-shadow)' if o['shadow'] else ''}")
        if bad:
            bad_pages.append(page.name)

    print(f"\n{len(pages)} pages, {seen} focus rings measured against the ground they are "
          f"drawn on,\n{skipped} on a gradient this cannot read, {others} drawn some way other "
          f"than an outline.\n{failures} under {NEED}:1 on {len(bad_pages)} page(s).")
    if bad_pages:
        print(
            "\nA keyboard user moving through these pages cannot see where they are. Set\n"
            "the ring at the room, beside its link colour -- the fog in §39 is the\n"
            "pattern -- rather than changing §2's yellow, which is right on the dark\n"
            "street."
        )
    sys.exit(1 if bad_pages else 0)


if __name__ == "__main__":
    main()
