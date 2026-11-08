"""What a page rendered in Chrome was made from, so an unchanged page is not
rendered again. Shared by check-gentle.py, check-contrast-live.py and
check-focus.py, by make-og.py for its share cards, and (keyed without asking
the page, at the foot of this file) by check-print.py and make-icons.py.

WHY (Ryan's ask, 2026-11-08): a full check-all.sh started Chrome about seven
hundred times, once a page for each of four tools, and took fourteen minutes,
with Chrome icons coming and going in the Dock and the laptop slow the whole
time. Nearly every one of those renders was of a page nothing had touched since
the last run, measuring exactly what it measured then.

WHAT DECIDES A RENDER, AND SO WHAT IS HASHED. The page's own bytes; every
script and stylesheet the page actually loaded, in the document and in every
shadow root, as the page itself reported them at the moment it was measured
(LOADED_JS), so a script injected by another script is counted and one a page
never loads (cb.js, without a pass) is not; love.css and every file it names
in url() (the faces above all, which decide where every line breaks); the
tool's own source and this file's, which hold what is measured and how; and
the version of Chrome, because another Chrome lays a page out its own way.
If any of those has changed by a byte, the page is rendered again. Nothing is
guessed from a file's name or its date.

WHAT IS NOT HASHED, ON PURPOSE. Pictures, for the three checkers: what they
measure (a transform, a colour against its ground, a focus ring) never depends
on what a picture shows, and contrast-live declines text standing on a picture
rather than reading it. fetch() and XHR: on file:// Chrome refuses them, so they
fail the same way whatever the file holds. A share card does depend on its
pictures, so make-og.py hashes every file its card names as well.

THE CACHE IS THIS MAC'S AND IS NEVER COMMITTED (.cache/ is gitignored). Two
Macs run different Chromes, so a result from one is not a result for the
other. Delete .cache/render/ to render everything, or run check-all.sh --full,
which sets RENDER_FRESH for every tool (or pass a tool --fresh).

One thing a cache cannot keep the same: within a run, pages share one Chrome
profile, so a page that stores something (localStorage) is seen by the pages
probed after it. A page reused from the cache stores nothing this time. No
checker depends on that today, and a page whose render depends on what another
page left behind is a fault to find, not a thing to preserve.
"""
import hashlib
import json
import os
import plistlib
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "render"
FRESH = "--fresh" in sys.argv or bool(os.environ.get("RENDER_FRESH"))

# Reported once the page has finished measuring, and again a little later in
# virtual time, so a script one of the page's scripts adds late is still listed.
# Paths come back relative to the repository; anything outside it is left out.
LOADED_JS = r"""
<script>
(function () {
  var root = new URL('.', location.href).href;
  function report() {
    var got = new Set();
    function local(u) {
      if (!u) return;
      try { u = new URL(u, location.href).href; } catch (e) { return; }
      if (u.indexOf(root) === 0) got.add(decodeURIComponent(u.slice(root.length).split('#')[0].split('?')[0]));
    }
    (function walk(r) {
      r.querySelectorAll('script[src]').forEach(function (s) { local(s.src); });
      r.querySelectorAll('link[href]').forEach(function (l) {
        if (/stylesheet|preload|modulepreload/i.test(l.rel || '')) local(l.href);
      });
      r.querySelectorAll('*').forEach(function (el) { if (el.shadowRoot) walk(el.shadowRoot); });
    })(document);
    var m = document.getElementById('probe-loaded');
    if (!m) { m = document.createElement('meta'); m.id = 'probe-loaded'; document.head.appendChild(m); }
    m.setAttribute('content', JSON.stringify(Array.from(got).sort()));
  }
  window.addEventListener('load', function () {
    report();
    [0, 500, 1500, 3000, 3900, 4900].forEach(function (t) { setTimeout(report, t); });
  });
})();
</script>
"""

_digests = {}


def digest(rel):
    """sha256 of a file in the repository, once a run; 'missing' if it is not there."""
    if rel not in _digests:
        p = ROOT / rel
        _digests[rel] = hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else "missing"
    return _digests[rel]


def loaded(dom):
    """The files a probed page reported loading, out of its dumped DOM."""
    import html
    m = re.search(r'<meta id="probe-loaded" content="([^"]*)"', dom)
    if not m:
        return None
    return json.loads(html.unescape(m.group(1)))


def chrome_version(browser):
    b = Path(browser)
    for plist in (b.parent.parent / "Info.plist",):
        if plist.is_file():
            try:
                return plistlib.loads(plist.read_bytes()).get("CFBundleShortVersionString", "")
            except Exception:
                pass
    try:
        return subprocess.run([browser, "--version"], capture_output=True, timeout=30).stdout.decode().strip()
    except Exception:
        return "unknown"


def love_css_files():
    css = (ROOT / "love.css").read_text()
    files = set()
    for u in re.findall(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", css):
        if u.startswith(("data:", "http:", "https:", "#")):
            continue
        files.add(u.split("#")[0].split("?")[0].lstrip("/"))
    return sorted(files)


def base(tool, browser, extra=""):
    """What every render by this tool depends on, whatever the page."""
    h = hashlib.sha256()
    for src in (Path(tool), Path(__file__)):
        h.update(src.read_bytes())
    h.update(f"\nchrome {chrome_version(browser)}\n{extra}\n".encode())
    h.update(f"love.css {digest('love.css')}\n".encode())
    for f in love_css_files():
        h.update(f"{f} {digest(f)}\n".encode())
    return h.hexdigest()


def key(base_key, page_bytes, files):
    h = hashlib.sha256(base_key.encode())
    h.update(hashlib.sha256(page_bytes).digest())
    for f in sorted(set(files)):
        h.update(f"\n{f} {digest(f)}".encode())
    return h.hexdigest()


class Cache:
    """One tool's results, by page: what it loaded, the key, and the result."""

    def __init__(self, name, tool, browser, extra=""):
        self.path = CACHE / f"{name}.json"
        self.base = base(tool, browser, extra)
        try:
            self.entries = {} if FRESH else json.loads(self.path.read_text())
        except Exception:
            self.entries = {}
        self.reused = 0
        self.rendered = 0

    def get(self, page):
        e = self.entries.get(page.name)
        if not e or not isinstance(e.get("loaded"), list):
            return None
        if key(self.base, page.read_bytes(), e["loaded"]) != e.get("key"):
            return None
        self.reused += 1
        return e["result"]

    def put(self, page, files, result):
        self.rendered += 1
        if files is None:
            # The page never reported what it loaded: nothing to trust next time.
            self.entries.pop(page.name, None)
            return
        self.entries[page.name] = {"key": key(self.base, page.read_bytes(), files),
                                   "loaded": files, "result": result}

    def save(self, pages=None):
        if pages is not None:
            names = {p.name for p in pages}
            self.entries = {k: v for k, v in self.entries.items() if k in names}
        CACHE.mkdir(parents=True, exist_ok=True)
        tmp = self.path.with_suffix(".tmp")
        tmp.write_text(json.dumps(self.entries, sort_keys=True))
        tmp.replace(self.path)

    def said(self):
        return (f"{self.rendered} rendered in Chrome, {self.reused} unchanged since this Mac last "
                "rendered them and reused (tools/render_cache.py).")


# ── For tools that cannot ask the page what it loaded ──────────────────────
# check-print.py prints to PDF and make-icons.py takes screenshots, so neither
# gets a page back to read LOADED_JS out of. Each is keyed on what could decide
# its render instead, read without Chrome, erring towards rendering again.

REF = re.compile(r'''(?:src|href)\s*=\s*["']([^"'#?]+)''')


def page_refs(page):
    """Every file in the repository a page names in src or href."""
    out = set()
    for u in REF.findall(page.read_text()):
        if u.startswith(("data:", "http:", "https:", "mailto:", "//")):
            continue
        try:
            rel = (page.parent / u.lstrip("/")).resolve().relative_to(ROOT).as_posix()
        except ValueError:
            continue
        out.add(rel)
    return out


def site_code():
    """Every script and stylesheet at the root: any one of them can be loaded by
    another, and a print cannot say which were."""
    return {p.name for p in ROOT.glob("*.js") if not p.name.startswith(".")} | \
           {p.name for p in ROOT.glob("*.css") if not p.name.startswith(".")}


def static_files(page):
    return sorted(page_refs(page) | site_code())


class Whole:
    """One key for a tool whose every output comes from a few named inputs
    (make-icons.py: favicon.svg). Unchanged means the key matches and every
    output is still the file this Mac wrote last time."""

    def __init__(self, name, tool, browser, inputs, outputs):
        self.path = CACHE / f"{name}.json"
        self.outputs = [Path(o) for o in outputs]
        h = hashlib.sha256()
        for src in (Path(tool), Path(__file__)):
            h.update(src.read_bytes())
        h.update(f"\nchrome {chrome_version(browser)}\n".encode())
        for f in inputs:
            rel = Path(f).resolve().relative_to(ROOT).as_posix()
            h.update(f"{rel} {digest(rel)}\n".encode())
        self.key = h.hexdigest()

    @staticmethod
    def _now(p):
        return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None

    def unchanged(self):
        if FRESH:
            return False
        try:
            e = json.loads(self.path.read_text())
        except Exception:
            return False
        if e.get("key") != self.key:
            return False
        return all(self._now(o) is not None and self._now(o) == e.get("outputs", {}).get(o.name)
                   for o in self.outputs)

    def save(self):
        CACHE.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps({"key": self.key,
                                         "outputs": {o.name: self._now(o) for o in self.outputs}}))
