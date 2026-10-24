#!/usr/bin/env python3
"""Write the low-stimulation modes' remap of the CB's colours, and hold the
modes to what they promise.

The proposal, 2026-10-24: "Feeling overwhelmed? Escape to a low-stimulation
mode." Warm Light, Cool Dark, Plant Green and Red Light, in the dial, laid over
every room's colours and the CB's themes, as escape modes for when folks are
overwhelmed. A mode is html[data-low], kept under love-low and put on before
the first paint by the snippet in every page's <head>; love.css §3 does the
rest, in one cascade layer whose !important outranks every room's.

What this writes: between the low:remap markers in love.css, every --cb-*
colour in §2 (every theme's seven, and their drawings' own inks), the bodymind
break's --bbr-*, the fractal window's frame --fx-*, the battle jacket's --bj-*
and the profile effects' --pfx-*, each pointed at one of the mode's six
colours, so every shadow root that wears them follows a mode without a script.
A new theme or a new colour in one of those families is in the next run. A
Tasks tag or status colour is left alone, because there the colour is what
the tag says. Never hand-edit between the markers.

What it refuses, because each is a promise to somebody who is already having a
hard time:

  · A MODE WITH A COLOUR MISSING, or the modes in love.js, love.css and the
    pre-paint snippet disagreeing about which there are.
  · THE SNIPPET NOT PUTTING A MODE ON BEFORE THE FIRST PAINT, or a mode not
    being Gentle. A mode that arrived after the page had painted would flash
    the room's colours at the very person who asked not to see them.
  · THE OVERRIDE LOSING what makes it one: nothing moving, no background
    picture, the focus ring; or the mode's filter reaching a picture, which
    keeps its own colours (the polaroid wall's promise that we do not filter
    you, which make-polaroids.py holds for the photographs).
  · love-low being written by anything but love.js's setLow, or kept with
    anything but a mode's name; or privacy.html not listing it.
  · The radio keeping its theme's drawing or its motion in a mode, or a
    familiar walking about in one.

IF THIS REFUSES: fix the cause. Do not loosen it.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CSS = ROOT / "love.css"
LOVE = ROOT / "love.js"
CALL = ROOT / "call.js"
CBCSS = ROOT / "cb.css"
FAM = ROOT / "familiar.js"
PRIVACY = ROOT / "privacy.html"
INDEX = ROOT / "index.html"

ROLES = ("g", "plate", "ink", "quiet", "link", "line")
# The radio's seven, longest first, so steel-2 is not read as steel.
CB_ROLES = [("steel-2", "quiet"), ("amber-2", "quiet"), ("case", "g"), ("bar", "plate"),
            ("steel", "ink"), ("lcd", "plate"), ("amber", "ink")]
BBR = [("plate", "plate"), ("ink", "ink"), ("quiet", "quiet"), ("leaf", "link"), ("far", "plate"), ("near", "plate")]
FX = {"case": "g", "bar": "plate", "text": "ink", "dim": "quiet", "lit": "link", "on": "g"}
LEFT_ALONE = ("--cb-task-", "--cb-status-")

problems = []


def code_of(text):
    c = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def root_vars(css):
    start = css.index(":root {")
    block = css[start:css.index("\n}", start)]
    block = re.sub(r"/\*.*?\*/", " ", block, flags=re.S)
    return re.findall(r"(--[a-z0-9-]+)\s*:", block)


def role_of(name):
    if name.startswith(LEFT_ALONE):
        return None
    if name.startswith("--cb-"):
        for suffix, role in CB_ROLES:
            if name == f"--cb-{suffix}" or name.endswith(f"-{suffix}"):
                return role
        return "line"
    if name.startswith("--bbr-"):
        for suffix, role in BBR:
            if name.endswith(f"-{suffix}"):
                return role
        return "g"
    if name.startswith("--fx-"):
        return FX.get(name[5:], "line")
    if name.startswith(("--bj-", "--pfx-")):
        return "line"
    return None


def remap(css):
    pairs = [(n, role_of(n)) for n in dict.fromkeys(root_vars(css))]
    pairs = [(n, r) for n, r in pairs if r]
    lines = []
    for i in range(0, len(pairs), 4):
        lines.append("  " + " ".join(f"{n}: var(--low-{r});" for n, r in pairs[i:i + 4]))
    return "html[data-low] {\n" + "\n".join(lines) + "\n}", len(pairs)


def modes_in_css(css):
    return re.findall(r'html\[data-low="([a-z]+)"\] \{', css)


css = CSS.read_text()
block, n = remap(css)
m = re.search(r"(/\* low:remap:begin \*/\n)(.*?)(/\* low:remap:end \*/)", css, re.S)
if not m:
    problems.append("love.css: the low:remap markers are missing, so there is nowhere to write the CB's colours.")
else:
    out = css[:m.start(2)] + block + "\n" + css[m.end(2):]
    if out != css:
        CSS.write_text(out)
        css = out
        print(f"wrote {n} CB, break, fractal and profile colours into the modes' remap")

love = code_of(LOVE.read_text())
lm = re.search(r"var LOWS = \[([^\]]*)\];", love)
lows = re.findall(r"'([a-z]+)'", lm.group(1)) if lm else []
if not lows:
    problems.append("love.js: no LOWS, the list of modes the dial offers.")
css_modes = modes_in_css(css)
if sorted(css_modes) != sorted(lows):
    problems.append(f"love.css's modes {css_modes} are not love.js's {lows}.")
for low in css_modes:
    body = re.search(rf'html\[data-low="{low}"\] \{{(.*?)\}}', css, re.S).group(1)
    for role in ROLES + ("filter",):
        if f"--low-{role}:" not in body:
            problems.append(f"love.css: {low} has no --low-{role}.")
    for v in re.findall(r"var\((--lsm-[a-z0-9-]+)\)", body):
        if v not in root_vars(css):
            problems.append(f"love.css: {low} reads {v}, which §2 does not declare.")
    if "color-scheme:" not in body:
        problems.append(f"love.css: {low} does not say whether it is light or dark (color-scheme).")

snippet = re.search(r"<script>(var d=document\.documentElement.*?)</script>", INDEX.read_text(), re.S)
if not snippet:
    problems.append("index.html: the pre-paint snippet has gone.")
else:
    s = snippet.group(1)
    if "localStorage.getItem('love-low')" not in s or "d.setAttribute('data-low',l)" not in s or "v='gentle'" not in s:
        problems.append("the pre-paint snippet does not put a mode on before the first paint, or does not make it Gentle.")
    named = re.search(r"l==='[a-z]+'(?:\|\|l==='[a-z]+')*", s)
    if not named or sorted(re.findall(r"l==='([a-z]+)'", named.group(0))) != sorted(lows):
        problems.append("the pre-paint snippet's modes are not love.js's.")

layer = re.search(r"@layer low-stimulation \{(.*?)\n\}", css, re.S)
if not layer:
    problems.append("love.css: the low-stimulation layer has gone.")
else:
    lay = layer.group(1)
    for need, why in (("animation: none !important", "nothing moves in a mode"),
                      ("transition: none !important", "nothing moves in a mode"),
                      ("background-image: none !important", "no room's picture or gradient stays behind the words"),
                      ("color: var(--low-ink) !important", "every word is the mode's ink"),
                      (":focus-visible { outline: 3px solid var(--low-link) !important", "the keyboard can always be seen"),
                      ):
        if need not in lay:
            problems.append(f"love.css: the layer has lost {need!r}: {why}.")
    # A picture keeps its own colours (make-polaroids.py holds the photographs);
    # this holds the layer to it, so nobody filters images "just in a mode".
    for sel in re.findall(r"([^{}]+)\{[^}]*\bfilter\s*:\s*var\(--low-filter\)", re.sub(r"/\*.*?\*/", " ", lay, flags=re.S)):
        if re.search(r"\b(?:img|picture)\b|\.photo\b", sel):
            problems.append(f"love.css: the mode's filter reaches a picture ({sel.strip()}); a picture keeps its own colours.")

writes = re.findall(r"store\((\w+),", love)
if "LOW_KEY" in love and "var LOW_KEY = 'love-low';" not in love:
    problems.append("love.js: a mode is kept under love-low, which privacy.html names.")
if love.count("store(LOW_KEY") != 1 or not re.search(r"function setLow\(low, quiet\) \{[^}]*LOWS\.indexOf\(low\) >= 0", love):
    problems.append("love.js: love-low is written by setLow and nowhere else, and only with a mode's name.")
if "Feeling overwhelmed? Escape to a low-stimulation mode." not in love:
    problems.append("love.js: the dial's line, Feeling overwhelmed? Escape to a low-stimulation mode., has gone.")
if "love-low" not in PRIVACY.read_text():
    problems.append("privacy.html: love-low is not in the list of what your browser keeps.")

call = code_of(CALL.read_text())
if "host.setAttribute('data-low', low)" not in call or "!low && (dial() === 'max' || letMove())" not in call:
    problems.append("call.js: the radio's host is not told about a mode, or its drawing still moves in one.")
if ":host([data-low]) .cb-trim" not in CBCSS.read_text():
    problems.append("cb.css: the radio keeps its theme's drawing in a mode.")
if "hasAttribute('data-low')" not in code_of(FAM.read_text()):
    problems.append("familiar.js: a familiar walks about in a mode.")

if problems:
    print("REFUSING:")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print(f"{len(lows)} low-stimulation modes, on before the first paint, over every room and every CB theme")
