#!/usr/bin/env python3
"""Hold Bring Your Muchness, the fanfare for turning up to MAX GLITTER, to what
it promises.

Ryan's ask, 2026-10-29: Esmx rising from the bottom of the screen in an aura
of glitter, and "Bring Your Muchness" in glittering letters above them, when
somebody turns on MAX GLITTER. Esmx is Kaya Oldaker's own Rainbow Leaping
(Ryan's call the same day: her original art, not the Arcade's redrawing).
muchness.js and muchness.css are the fanfare; love.js plays it.

What this refuses, because each is a promise somebody may be relying on:

  · THE FANFARE PLAYING BY ITSELF. love.js may call muchness() only from
    setLevel, and only when the level goes up to MAX from something else. A
    page that opens at MAX already would otherwise play it on every page.
  · IT PLAYING ON A QUIET PAGE OR IN A FRAME. Both love.js and muchness.js ask
    data-cb="off" (Stay Frosty says nothing moves there at any setting) and
    window.top, and Stay Frosty must still say data-cb="off".
  · THE WORDS ONLY BEING SEEN. The fanfare is aria-hidden; the dial's own line
    at MAX says "Bring your muchness", so nobody who cannot see it misses it.
  · A FLASH. No spark may go out faster than FADE_FLOOR, at least 1500 ms, and
    the spark keyframes must spend three quarters of a spark's time going out.
  · A ROTATION OR A SKEW in muchness.css, which check-gentle.py could not tell
    from a tilt.
  · A SOUND, ANYTHING KEPT OR SENT, or markup from a string, in muchness.js.
  · A COLOUR OF ITS OWN in muchness.css: only var(--much-*), each declared in
    love.css's :root (check-contrast.py measures them all).
  · ESMX WITHOUT KAYA: her name on the picture's own markup, her alt text on
    it, an entry in the liner notes, and the file carrying no metadata.

IF THIS REFUSES: fix the cause. Do not loosen it.
"""
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "muchness.js"
CSS = ROOT / "muchness.css"
LOVE = ROOT / "love.js"
LOVECSS = ROOT / "love.css"
ART = ROOT / "art" / "esmx-leaping.webp"
NOTES = ROOT / "liner-notes.html"
FROSTY = ROOT / "stay-frosty.html"

problems = []


def strip_comments(src):
    return re.sub(r"/\*.*?\*/", "", src, flags=re.S)


def check_love():
    src = LOVE.read_text()
    code = strip_comments(src)
    calls = re.findall(r"\bmuchness\(\)", code)
    if len(calls) != 2:   # the definition and the one call in setLevel
        problems.append(f"love.js: muchness() is called {len(calls) - 1} times; it may be called once, from setLevel.")
    m = re.search(r"function setLevel\(level\) \{(.*?)\n  \}", code, re.S)
    if not m or "if (up) muchness();" not in m.group(1):
        problems.append("love.js: setLevel must play the fanfare as `if (up) muchness();`, and nowhere else.")
    elif not re.search(r"var up = level === 'max' && \(levelNow\(\) !== 'max'", m.group(1)):
        problems.append("love.js: setLevel must play the fanfare only when the level goes UP to MAX "
                        "(level === 'max' and levelNow() was not), or a page at MAX plays it by itself.")
    f = re.search(r"function muchness\(\) \{(.*?)\n  \}", code, re.S)
    if not f:
        problems.append("love.js: function muchness() is gone.")
    else:
        body = f.group(1)
        if "getAttribute('data-cb') === 'off'" not in body or "window.top !== window.self" not in body:
            problems.append("love.js: muchness() must stay off a page whose <body> says data-cb=\"off\" and out of frames.")
    notes = re.search(r"max:\s*'([^']*)'", code)
    if not notes or "Bring your muchness" not in notes.group(1):
        problems.append("love.js: the dial's line at MAX must say \"Bring your muchness\", so the words are not only seen.")


def check_js():
    src = JS.read_text()
    code = strip_comments(src)
    for pat, why in [
        (r"localStorage|sessionStorage|indexedDB|document\.cookie", "keeps something"),
        (r"\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource", "sends something"),
        (r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", "writes markup from a string"),
        (r"AudioContext|new Audio\b|\.play\(\)|speechSynthesis|vibrate\(", "makes a sound or a buzz"),
        (r"rotate|skew", "turns or skews something"),
    ]:
        if re.search(pat, code):
            problems.append(f"muchness.js {why}; the fanfare keeps nothing, sends nothing, makes no sound and only translates and scales.")
    if "getAttribute('data-cb') === 'off'" not in code or "window.top !== window.self" not in code:
        problems.append("muchness.js: quiet() must ask data-cb=\"off\" and window.top itself.")
    fl = re.search(r"var FADE_FLOOR = (\d+);", code)
    if not fl or int(fl.group(1)) < 1500:
        problems.append("muchness.js: FADE_FLOOR must be at least 1500 ms, so no spark goes out fast enough to flash.")
    if "FADE_FLOOR / 0.75" not in code:
        problems.append("muchness.js: a spark's time must be worked out from FADE_FLOOR / 0.75, since three quarters of it is the going out.")
    if "setAttribute('aria-hidden', 'true')" not in code:
        problems.append("muchness.js: the fanfare must be aria-hidden; the dial's line carries the words.")
    if "Kaya Oldaker" not in code:
        problems.append("muchness.js: Kaya Oldaker's name must be on the picture's own markup (data-credit).")
    if "Esmx is running and punching the air with one fist." not in code:
        problems.append("muchness.js: the picture must carry Kaya's alt text for Rainbow Leaping.")
    if "'/art/esmx-leaping.webp'" not in code:
        problems.append("muchness.js: Esmx is art/esmx-leaping.webp, Kaya's Rainbow Leaping.")
    if "pointerdown" not in code or "'Escape'" not in code or "visibilitychange" not in code:
        problems.append("muchness.js: a press anywhere, Escape and a hidden tab must each end the fanfare.")


def check_css():
    src = strip_comments(CSS.read_text())
    if re.search(r"rotate|skew|matrix", src):
        problems.append("muchness.css turns or skews something; translate and scale only, which check-gentle.py can read.")
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(", src):
        problems.append("muchness.css names a colour of its own; only var(--much-*), which check-contrast.py measures.")
    declared = set(re.findall(r"(--much-[a-z0-9-]+):", LOVECSS.read_text()))
    for name in sorted(set(re.findall(r"var\((--much-[a-z0-9-]+)\)", src)) - declared):
        problems.append(f"muchness.css uses {name}, which love.css's :root does not declare.")
    for name in re.findall(r"var\((--[a-z0-9-]+)\)", src):
        if not name.startswith("--much-") and name not in ("--x", "--y", "--s", "--t", "--d", "--rise"):
            problems.append(f"muchness.css uses {name}, which is not the fanfare's.")
    spark = re.search(r"@keyframes much-spark \{(.*?)\n\}", src, re.S)
    if not spark or not re.search(r"25%\s*\{\s*opacity:\s*1", spark.group(1)) or not re.search(r"100%\s*\{\s*opacity:\s*0", spark.group(1)):
        problems.append("muchness.css: a spark must be fully up by 25% of its time and gone at 100%, three quarters of it going out.")
    if "pointer-events: none" not in src:
        problems.append("muchness.css: nothing on the fanfare may catch a press (pointer-events: none).")


def webp_chunks(data):
    out, i = [], 12
    while i + 8 <= len(data):
        tag, size = data[i:i + 4].decode("latin-1"), struct.unpack("<I", data[i + 4:i + 8])[0]
        out.append(tag)
        i += 8 + size + (size & 1)
    return out


def check_art():
    if not ART.exists():
        problems.append("art/esmx-leaping.webp is missing.")
        return
    data = ART.read_bytes()
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        problems.append("art/esmx-leaping.webp is not a WebP.")
        return
    bad = [c for c in webp_chunks(data) if c.strip() in ("EXIF", "XMP", "ICCP")]
    if bad:
        problems.append(f"art/esmx-leaping.webp carries metadata ({', '.join(bad)}); save it with none.")
    notes = NOTES.read_text()
    if "muchness" not in notes.lower() or "Rainbow Leaping" not in notes:
        problems.append("liner-notes.html must credit Kaya's Rainbow Leaping where Bring Your Muchness uses it.")
    if 'data-cb="off"' not in FROSTY.read_text():
        problems.append("stay-frosty.html no longer says data-cb=\"off\", which is what keeps the fanfare out of a room where nothing moves.")


check_love()
check_js()
check_css()
check_art()

if problems:
    print("REFUSING Bring Your Muchness:")
    for p in problems:
        print("  · " + p)
    sys.exit(1)
print("Bring Your Muchness: plays only on the press up to MAX, never on a quiet page, nothing flashes, nothing kept, Kaya credited.")
