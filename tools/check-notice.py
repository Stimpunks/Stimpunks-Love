#!/usr/bin/env python3
"""Hold the notice to what it, the desk and privacy.html say.

Ryan's ask, 2026-10-23: a public notice along the top of the street's front
page, the Community Center, Home, the forums and the office's dashboard, put up from
the desk in the Moderators' room, with sparkle and a fanfare at MAX GLITTER.
lib.test.mjs tests what the server does. This checks what a friendly edit could
break without a test noticing:

  · NOTHING A MODERATOR TYPES BECOMES MARKUP. notice.js builds the words with
    markdown.js, the street's one builder, and has no innerHTML or relative.
  · IT KEEPS ONE THING AND SENDS NOTHING. notice.js asks for /cb/notice and its
    own files, and nothing else. A visitor can put the notice away (Ryan's call,
    2026-10-23), which keeps its id under love-notice, the one key it may write,
    listed on privacy.html; it reads love-cb only for the radio's colours. The
    desk's previews remember nothing.
  · IT MAKES NO SOUND. A notice arrives without being pressed, and nothing on
    the street sounds until somebody presses something.
  · NOTHING MOVES BELOW MAX, NOTHING FLASHES, AND IT NAMES NO COLOUR. Every
    animation in notice.css is under :host([data-dial="max"]); there is no
    transition, rotation or skew; no keyframe changes a colour; a star takes
    two seconds at least to come and go; and the only colours are the radio's
    seven --cb-*, which check-contrast.py measures in every theme.
  · ONLY A MODERATOR PUTS IT UP OR TAKES IT DOWN, ONE LINE AT A TIME, and the
    pages are told the words and nothing about who.
  · IT IS ON THE PAGES privacy.html NAMES, AND NOWHERE ELSE. Another page is a
    sentence on the privacy page first, then a line here.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
JS = ROOT / "notice.js"
CSS = ROOT / "notice.css"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-notice.mjs"
DESK = ROOT / "desk.js"
ROOM = ROOT / "town-hall-moderators.html"
PRIVACY = ROOT / "privacy.html"
# The pages with a slot of their own, and the apps that draw one inside theirs.
SLOTS = ("index.html", "community-center.html", "home.html")
APPS = {"forum.html": "forum.js", "office.html": "office.js"}
# Custom properties notice.js sets on its own stars and notes, which are not colours.
OWN_VARS = {"--tw", "--td", "--fx", "--fy", "--fd"}

problems = []


def code_of(path):
    c = re.sub(r"/\*.*?\*/", " ", path.read_text(), flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def check_script():
    js = code_of(JS)
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The words are built from nodes by markdown.js, never as HTML.")
    if "window.loveMarkdown.blocks" not in js:
        problems.append(f"{JS.name}: it builds the words some way other than markdown.js, the street's one builder.")
    for bad in ("sessionStorage", "indexedDB", "document.cookie", "localStorage.clear", "localStorage["):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The notice keeps love-notice in the browser and nothing else.")
    if "var KEY = 'love-notice';" not in js:
        problems.append(f"{JS.name}: a notice put away is kept under love-notice, which privacy.html names.")
    for m in re.finditer(r"localStorage\.(getItem|setItem|removeItem)\(\s*([^,)]+)", js):
        what, key = m.group(1), m.group(2).strip()
        if key != "KEY" and not (what == "getItem" and key == "'love-cb'"):
            problems.append(f"{JS.name}: localStorage.{what}({key}). It writes love-notice and nothing else, and reads love-cb only for the colours.")
    if "if (!preview) keep(notice.id);" not in js or "put(slot, notice, true)" not in js:
        problems.append(f"{JS.name}: the desk's previews must remember nothing when they are put away.")
    if "'Put it away'" not in js or "away.type = 'button'" not in js:
        problems.append(f"{JS.name}: the notice has lost its Put it away button.")
    for bad in ("AudioContext", "new Audio", ".play(", "speechSynthesis"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The fanfare makes no sound: a notice arrives without being pressed.")
    for url in set(re.findall(r"""['"](/[a-z][^'"?#]*)""", js)):
        if url not in ("/cb/notice", "/markdown.js", "/cb.css", "/notice.css"):
            problems.append(f"{JS.name}: it asks for {url}. It asks for the notice and its own files, and nothing else.")
    if re.search(r"method\s*:", js):
        problems.append(f"{JS.name}: it sends a request with a method of its own. It only ever reads the notice.")
    if "setAttribute('aria-label', 'Notice')" not in js:
        problems.append(f"{JS.name}: the notice is no longer a region called Notice for a screen reader.")
    for part in ("herald", "stars"):
        if f"{part}.setAttribute('aria-hidden', 'true')" not in js:
            problems.append(f"{JS.name}: the {part} is not aria-hidden. Every drawing is; the words are what is read.")
    m = re.search(r"'--tw', \((\d+(?:\.\d+)?) \+", js)
    if not m or float(m.group(1)) < 2:
        problems.append(f"{JS.name}: a star must take two seconds at least to come and go, so nothing flashes.")


def css_rules(src):
    """(selector, body) for every ordinary rule, @keyframes taken out first and
    @media's own braces opened, so a rule inside one is read as itself."""
    src = re.sub(r"/\*.*?\*/", " ", src, flags=re.S)
    frames = {}
    for m in re.finditer(r"@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}", src):
        frames[m.group(1)] = m.group(2)
    src = re.sub(r"@keyframes\s+[\w-]+\s*\{(?:[^{}]*\{[^{}]*\})*\s*\}", " ", src)
    src = re.sub(r"@media[^{]*\{((?:[^{}]*\{[^{}]*\})*)\s*\}", r"\1", src)
    return [(s.strip(), b) for s, b in re.findall(r"([^{}]+)\{([^{}]*)\}", src)], frames


def check_style():
    raw = CSS.read_text()
    src = re.sub(r"/\*.*?\*/", " ", raw, flags=re.S)
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(", src):
        problems.append(f"{CSS.name}: it names a colour. The notice wears the radio's seven --cb-* and nothing else.")
    for name in set(re.findall(r"var\((--[\w-]+)", src)):
        if not name.startswith("--cb-") and name not in OWN_VARS:
            problems.append(f"{CSS.name}: var({name}). The only colours are the radio's --cb-*, which check-contrast.py measures.")
    for bad in ("transition", "rotate", "skew", "matrix"):
        if bad in src:
            problems.append(f"{CSS.name}: {bad}. Nothing turns, and nothing eases in or out below MAX.")
    rules, frames = css_rules(raw)
    if not frames:
        problems.append(f"{CSS.name}: no @keyframes found. This tool can no longer read the sparkle, so it checks nothing.")
    for sel, body in rules:
        if re.search(r"\banimation(?:-name)?\s*:", body) and ':host([data-dial="max"])' not in sel:
            problems.append(f"{CSS.name}: {sel} moves below MAX GLITTER. Every animation is under :host([data-dial=\"max\"]).")
    for name, body in frames.items():
        if re.search(r"\b(?:color|background|fill|stroke|filter|box-shadow)\s*:", body):
            problems.append(f"{CSS.name}: @keyframes {name} changes a colour. A changing colour is how a flash starts.")


def check_server():
    lib = LIB.read_text()
    for name in ("setNotice", "clearNotice"):
        if "who.role !== 'base'" not in fn(lib, name):
            problems.append(f"{LIB.name}: {name} no longer refuses anybody but a moderator.")
    shape = fn(lib, "shapeNotice")
    if not shape or re.search(r"\bby\b|\.t\b", shape) or "id: noticeId(d.text)" not in shape:
        problems.append(f"{LIB.name}: shapeNotice tells the pages the words and their id, and nothing about who or when.")
    if "createHash('sha256').update(String(text))" not in fn(lib, "noticeId"):
        problems.append(f"{LIB.name}: a notice's id is worked out from its words alone, so it says nothing about who or when.")
    clean = fn(lib, "cleanNotice")
    if "includes('\\n')" not in clean or "ast[0].t === 'p'" not in clean:
        problems.append(f"{LIB.name}: cleanNotice no longer keeps a notice to one line and one paragraph.")
    m = re.search(r"export const NOTICE_MAX = (\d+);", lib)
    desk_max = re.search(r'id="md-notice-words"[^>]*maxlength="(\d+)"|maxlength="(\d+)"[^>]*id="md-notice-words"', ROOM.read_text())
    if not m or not desk_max or (desk_max.group(1) or desk_max.group(2)) != m.group(1):
        problems.append(f"{ROOM.name}: the desk's box must take NOTICE_MAX characters, as lib.mjs counts them.")
    if not re.search(r"export const NOTICE_FIRST = Object\.freeze\(\{ text: '[^']+', by: null, t: null \}\);", lib):
        problems.append(f"{LIB.name}: NOTICE_FIRST is the first notice, which came with the site, put up by nobody.")
    f = code_of(FN)
    if "if (req.method === 'GET') return json(200, { notice: shapeNotice(await readNotice()) });" not in f:
        problems.append(f"{FN.name}: GET must answer the shaped notice and nothing else.")
    base, act = f.find("who.role !== 'base'"), f.find("b.action")
    if base < 0 or act < 0 or base > act:
        problems.append(f"{FN.name}: it must refuse anybody but a moderator before any action.")
    if "console." in f:
        problems.append(f"{FN.name}: it logs. Nothing a person types is logged.")


def check_pages():
    for page in sorted(ROOT.glob("*.html")):
        text = page.read_text()
        if "data-notice" in text and page.name not in SLOTS:
            problems.append(f"{page.name}: it has a notice slot. privacy.html names the pages with one; add it there first, then here.")
    for name in SLOTS:
        text = (ROOT / name).read_text()
        main = re.search(r"<main\b.*?</main>", text, re.S)
        if not main or "<div data-notice hidden></div>" not in main.group(0):
            problems.append(f"{name}: no empty, hidden notice slot in <main>.")
        if '<script src="notice.js" defer></script>' not in text:
            problems.append(f"{name}: it does not load notice.js.")
    for page, app in APPS.items():
        text = (ROOT / page).read_text()
        at = [text.find(f'<script src="{s}" defer></script>') for s in ("markdown.js", "notice.js", app)]
        if min(at) < 0 or at != sorted(at):
            problems.append(f"{page}: it must load markdown.js, then notice.js, then {app}.")
    for js in sorted(ROOT.glob("*.js")):
        if js.name == JS.name:
            continue
        src = code_of(js)
        if "loveNotice.into(" in src and js.name not in APPS.values():
            problems.append(f"{js.name}: it draws the notice. privacy.html names where it goes; add it there first, then here.")
        if "loveNotice.draw(" in src and js.name != DESK.name:
            problems.append(f"{js.name}: it draws a notice of its own. Only the desk previews one.")
    for app in APPS.values():
        if "window.loveNotice.into(" not in code_of(ROOT / app):
            problems.append(f"{app}: the notice is not drawn there.")
    if "window.loveNotice.into(" not in re.search(r"function drawDashboard\(.*?\n  \}", (ROOT / "office.js").read_text(), re.S).group(0):
        problems.append("office.js: the notice belongs on the dashboard.")
    room = ROOM.read_text()
    at = [room.find(f'<script src="{s}" defer></script>') for s in ("notice.js", "desk.js")]
    if 'id="md-notice"' not in room or 'id="md-notice-off"' not in room or min(at) < 0 or at[0] > at[1]:
        problems.append(f"{ROOM.name}: the desk's notice part, or notice.js before desk.js, is missing.")
    if "'/cb/notice'" not in code_of(DESK):
        problems.append(f"{DESK.name}: the desk no longer puts the notice up.")
    priv = PRIVACY.read_text()
    if "<td><code>love-notice</code></td>" not in priv:
        problems.append(f"{PRIVACY.name}: love-notice is not in the table of what the browser keeps.")
    sec = re.search(r'<h2 id="notice">.*?(?=<h2)', priv, re.S)
    if not sec:
        problems.append(f"{PRIVACY.name}: it has no section on the notice (id=\"notice\").")
    elif not all(w in sec.group(0) for w in ("front page", "Community Center", "forums", "dashboard")):
        problems.append(f"{PRIVACY.name}: the notice's section must name every page it is on.")
    elif any(f'href="{name}"' not in sec.group(0) for name in SLOTS + tuple(APPS)):
        problems.append(f"{PRIVACY.name}: the notice's section must link every page with a slot or an app that draws it.")


def main():
    check_script()
    check_style()
    check_server()
    check_pages()
    if problems:
        print("The notice does not hold:")
        for p in problems:
            print("  ·", p)
        sys.exit(1)
    print("The notice holds: built from nodes, silent, still below MAX, in the CB's colours, moderators' only, and only where privacy.html says.")


if __name__ == "__main__":
    main()
