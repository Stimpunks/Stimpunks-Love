#!/usr/bin/env python3
"""Write the bodymind break's forest into bodymind-break.js, and hold the break
to what it says.

Helen Edgar's idea, 2026-10-24: the street is busy even at Gentle, so a blank,
cool screen to regulate in, saying breathe, it will be okay, with a forest to
watch if you like, and a way to crisis lines if a break is not enough. Ryan's
answer: Cavendish Space's I need a bodymind break, on the CB and in the dial's
How loud do you want it? box. bodymind-break.js is the screen; love.js (the
dial), cb.js (the radio) and guest.js (the guest bar) each have its button.

What this writes: the one film, out of data/bodymind-break.json, between the
break:forest markers in bodymind-break.js. Never hand-edit between them.

What it refuses, because each is a sentence somebody may rely on while they are
already having a hard time:

  · A FILM WITH NO RUNTIME, or an id that is no YouTube id. The plate says how
    long before the press, the street's rule for every play button.
  · THE SCREEN KEEPING OR SENDING ANYTHING. No storage, no fetch or beacon or
    socket, no markup from a string, and no frame built anywhere but
    love-embed.js, and that frame apart, so the CB never takes the forest for
    the film on the page.
  · ANYTHING MOVING ON IT. No animation, transition, keyframe or transform in
    bodymind-break.css, at any setting, MAX GLITTER included.
  · A COLOUR OF ITS OWN. bodymind-break.css names colours only as var(--bbr-*)
    or through its own --g, --ink and the rest, which are those; check-contrast.py
    measures every --bbr-*.
  · THE BREAK PAUSING ANYTHING BY ITSELF. It offers Pause it; somebody may have
    the Latibulum's ocean waves on because they want them.
  · THE WAY TO CRISIS LINES GOING, the quiet rooms it names going or being no page,
    or the way back (I'm back) going.
  · A BUTTON GONE from the dial, the radio or the guest bar, or a page outside
    love.js's own rule getting one.
  · privacy.html without its section saying what the break keeps and sends.

IF THIS REFUSES: fix the cause. Do not loosen it.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "bodymind-break.json"
JS = ROOT / "bodymind-break.js"
CSS = ROOT / "bodymind-break.css"
LOVE = ROOT / "love.js"
CB = ROOT / "cb.js"
GUEST = ROOT / "guest.js"
EMBED = ROOT / "love-embed.js"
PRIVACY = ROOT / "privacy.html"
CRISIS = "https://stimpunks.org/fieldguide/coping/#h-crisis-hotlines"
HELP = "https://stimpunks.org/help/"

problems = []


def code_of(text):
    c = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def forest_line():
    data = json.loads(DATA.read_text())
    tracks = data.get("tracks") or []
    if len(tracks) != 1:
        problems.append(f"{DATA.name}: the break has one film, and this holds {len(tracks)}.")
        return None
    t = tracks[0]
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", t.get("id", "")):
        problems.append(f"{DATA.name}: {t.get('id')!r} is no YouTube id, and love-embed.js would build nothing for it.")
    if not re.fullmatch(r"(?:\d+:)?\d{1,2}:\d{2}", t.get("length", "")):
        problems.append(f"{DATA.name}: the forest has no runtime, and its plate must say how long before the press.")
    for k in ("title", "channel", "music", "what"):
        if not t.get(k):
            problems.append(f"{DATA.name}: the forest has no {k}, which its plate or its credit says.")
    keep = {k: t.get(k) for k in ("id", "title", "channel", "music", "length", "what")}
    return "  var FOREST = " + json.dumps(keep, ensure_ascii=False) + ";"


def write(line):
    src = JS.read_text()
    m = re.search(r"(  /\* break:forest:begin \*/\n)(.*?)(\n  /\* break:forest:end \*/)", src, re.S)
    if not m:
        problems.append(f"{JS.name}: the break:forest markers are missing, so there is nowhere to write the forest.")
        return
    out = src[:m.start(2)] + line + src[m.end(2):]
    if out != src:
        JS.write_text(out)
        print(f"wrote the forest into {JS.name}")


def check_script():
    js = code_of(JS.read_text())
    for bad in ("localStorage", "sessionStorage", "indexedDB", "document.cookie", "fetch(", "XMLHttpRequest",
                "sendBeacon", "WebSocket", "EventSource", "innerHTML", "outerHTML", "insertAdjacentHTML",
                "document.write", "DOMParser"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The break keeps nothing, sends nothing, and builds no markup from a string.")
    if re.search(r"createElement\(\s*['\"]iframe", js):
        problems.append(f"{JS.name}: it builds a frame itself. love-embed.js is the only thing on this site that builds one.")
    if not re.search(r"loveEmbed\.frame\(FOREST\.id,[^;]*,\s*null,\s*true\)", js):
        problems.append(f"{JS.name}: the forest is not built as a frame apart (loveEmbed.frame(..., null, true)), "
                        "so the CB could take it for the film on the page.")
    if re.search(r"\bquiet\(\)", js) and not re.search(r"function pauseHere\(\)", js):
        problems.append(f"{JS.name}: it pauses the page some way other than the Pause it button.")
    calls = [m.start() for m in re.finditer(r"pauseHere\b", js)]
    if len(calls) != 2 or "pauseBtn.addEventListener('click', pauseHere)" not in js:
        problems.append(f"{JS.name}: pauseHere must be called from the Pause it button and nowhere else; the break asks first.")
    if CRISIS not in js or HELP not in js:
        problems.append(f"{JS.name}: the way to crisis lines ({CRISIS}) or the Help page has gone. A break is not always enough.")
    if "'I\u2019m back'" not in js or "'close'" not in js:
        problems.append(f"{JS.name}: I'm back, or the close that puts the keyboard back, has gone.")
    if "'Play \u2014 ' + FOREST.length" not in js:
        problems.append(f"{JS.name}: the forest's plate does not say how long it runs before the press.")
    rooms = re.findall(r"\['/([a-z0-9-]+\.html)'", js)
    if not rooms:
        problems.append(f"{JS.name}: the quiet rooms on the street (Helen's link to a relaxing place) have gone.")
    for r in rooms:
        if not (ROOT / r).exists():
            problems.append(f"{JS.name}: it sends somebody to /{r}, which is no page on the street.")
    if "window.loveBreak = api" not in js:
        problems.append(f"{JS.name}: window.loveBreak is what the buttons and the radio's voice ask; it has gone.")


def check_css():
    css = code_of(CSS.read_text())
    for bad in ("animation", "transition", "@keyframes", "transform"):
        if bad in css:
            problems.append(f"{CSS.name}: {bad}. Nothing on the break moves, at any setting.")
    for m in re.finditer(r"#[0-9A-Fa-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|color-mix)\(", css):
        problems.append(f"{CSS.name}: a colour written as {m.group(0)}. Every colour here is one of §2's --bbr-*.")
    for m in re.finditer(r"var\((--[a-z0-9-]+)", css):
        v = m.group(1)
        if not (v.startswith("--bbr-") or v in ("--g", "--plate", "--ink", "--quiet", "--leaf", "--far", "--near")):
            problems.append(f"{CSS.name}: var({v}). The break wears its own --bbr-* colours and nothing else.")
    for name in ("--g", "--plate", "--ink", "--quiet", "--leaf", "--far", "--near"):
        for m in re.finditer(rf"{name}:\s*var\((--[a-z0-9-]+)\)", css):
            if not (m.group(1).startswith("--bbr-") or m.group(1) == "--ink"):
                problems.append(f"{CSS.name}: {name} is set to {m.group(1)}, which is not one of the break's own.")


def check_buttons():
    love = code_of(LOVE.read_text())
    if "breakButton(box)" not in love or "window.loveTakeBreak = takeBreak" not in love:
        problems.append(f"{LOVE.name}: the dial's I need a bodymind break, or the loader the guest bar uses, has gone.")
    fn = re.search(r"function breakButton\(box\) \{.*?\n  \}", love, re.S)
    if not fn or "getAttribute('data-cb') === 'off'" not in fn.group(0) or "window.top !== window.self" not in fn.group(0):
        problems.append(f"{LOVE.name}: the dial's break button must keep out of frames and pages that say data-cb=\"off\", "
                        "which are the pages already promising quiet.")
    cb = code_of(CB.read_text())
    if "'I need a bodymind break'" not in cb or "this.breakBarBtn.hidden = !folded" not in cb:
        problems.append(f"{CB.name}: the radio's break button, under where you are or on the folded bar, has gone.")
    if "breakUp()" not in cb:
        problems.append(f"{CB.name}: the radio speaks aloud during a break; speak must ask breakUp().")
    guest = code_of(GUEST.read_text())
    if "'I need a bodymind break'" not in guest or "window.loveTakeBreak(brk)" not in guest:
        problems.append(f"{GUEST.name}: the guest bar's break button has gone. A break is not only for people signed on.")
    embed = code_of(EMBED.read_text())
    if "function frame(id, title, start, apart)" not in embed or "&& !apart" not in embed:
        problems.append(f"{EMBED.name}: a frame apart, which the CB never hears about, has gone.")


def check_privacy():
    p = PRIVACY.read_text()
    m = re.search(r'id="bodymind-break".*?(?=<h[23] |</main>)', p, re.S)
    if not m:
        problems.append(f"{PRIVACY.name}: no section id=\"bodymind-break\" saying what the break keeps and sends.")
        return
    words = re.sub(r"<[^>]+>", " ", m.group(0))
    for need in ("nothing", "YouTube"):
        if need not in words:
            problems.append(f"{PRIVACY.name}#bodymind-break: it does not say {need!r}.")


line = forest_line()
if line and not problems:
    write(line)
check_script()
check_css()
check_buttons()
check_privacy()
if problems:
    print("REFUSING:")
    for p in problems:
        print("  " + p)
    sys.exit(1)
print("the bodymind break keeps nothing, sends nothing, moves nothing, and asks before it pauses anything")
