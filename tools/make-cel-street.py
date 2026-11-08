#!/usr/bin/env python3
"""Cel Street: draw the street in the sun over the page's name, and hold the
page and its script to what they say.

Ryan's ask, 2026-10-31: a WebGL version of the street in a 3D anime style, as a
proof of concept beside Paper Street, with solar panels on the roofs. He named
it Cel Street. cel-street.js builds it with three.js; this tool draws the
picture at the top of the page and refuses the page anything it says it does
not do.

THREE.JS IS VENDORED AND PINNED. The CSP lets scripts come from this site and
nowhere else, so three.js is a file in vendor/, with its MIT licence beside it,
and this tool refuses it if its bytes are not the ones recorded here. Updating
it is deciding to: download the release, read its licence, change VERSION and
SHA256 below in the same commit.

THE STREET IS READ, NOT COPIED. cel-street.js asks for index.html when the page
opens and takes its row of doors, its garden gate and its lots' gates, and each door's own
awning and name, so the shops are always the front page's. That only holds
while the front page has those parts, and at runtime a missing part would only
look like a broken game, so this tool reads index.html for them.

WHAT IT REFUSES IN cel-street.js:
  · any import but the vendored three.js, and any request but index.html and,
    on the Bring my avatar press, a GET of /cb/avatars (Ryan, 2026-11-04:
    your avatar and your chimera on Cel Street, as on Paper Street);
  · storage written, of any kind, and storage read but love-familiar (your
    chimera, which familiar.js keeps) and love-cb (the radio's pass, for that
    one GET); and anything sent some other way than fetch;
  · a page without data-familiar="walks", which love.js and familiar.js read
    so the familiar is not put on the page as well as on the street;
  · a timer: nothing moves by itself, so nothing waits on a clock;
  · a frame asked for by anything but walking (tick), a game controller
    (padTick), what a room lets move (moveTick) and the line a room's switch
    answers on; what moves held past the flash line (DIM past a tenth, HZ past
    two and a half a second, a twinkle quicker than once in three seconds, a
    turn quicker than once in 1.8), or moving in a low-stimulation mode or a
    hidden tab (Ryan, 2026-11-04: candles, a record and fairy lights in the
    Faery Yurt and its rooms, at MAX where her page moves them there and
    otherwise only on a press);
  · markup written from a string;
  · a colour written into the script, or a --cel- name love.css does not
    declare: every colour is read by name out of love.css.
AND IN love.css's §134: a keyframe, an animation or a transition.
"""
import hashlib
import html
import json
import random
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "cel-street.html"
JS = ROOT / "cel-street.js"
CSS = ROOT / "love.css"
INDEX = ROOT / "index.html"
THREE = ROOT / "vendor" / "three.module.min.js"
THREE_LICENCE = ROOT / "vendor" / "three-LICENSE.txt"
# three.js's CSS3D renderer, which stands a room's own page in its scene. Its
# one change from the release is the import line, which names the file above
# rather than the bare 'three'; it says so at its head.
CSS3D = ROOT / "vendor" / "CSS3DRenderer.js"
CSS3D_SHA256 = "7e88509c6b5ac7d21d7ffdb607779c61ed7ab6d50568d31c3bc3ecb24075adda"
VERSION = "0.160.0"
SHA256 = "3e690ac7d180b0aadf0891bea39eec643e29e2d3e75c99b18689518665f69ba6"

problems = []


def refuse(msg):
    problems.append(msg)


# ── three.js, the file and its licence ─────────────────────────────────────
if not THREE.exists():
    refuse("vendor/three.module.min.js is missing, and Cel Street is drawn with it.")
elif hashlib.sha256(THREE.read_bytes()).hexdigest() != SHA256:
    refuse(f"vendor/three.module.min.js is not three.js {VERSION} as recorded here. If it was "
           "updated on purpose, change VERSION and SHA256 in this tool in the same commit.")
if not CSS3D.exists() or hashlib.sha256(CSS3D.read_bytes()).hexdigest() != CSS3D_SHA256:
    refuse("vendor/CSS3DRenderer.js is missing or not the copy recorded here (three.js's, with its import\n"
           "  line pointing at the vendored file). If it changed on purpose, change CSS3D_SHA256 with it.")
if not THREE_LICENCE.exists() or "MIT License" not in THREE_LICENCE.read_text():
    refuse("vendor/three-LICENSE.txt, three.js's MIT licence, has to travel with the file.")

# ── The front page has every part the script reads ─────────────────────────
index = INDEX.read_text()
row = re.search(r'<ul class="doors">(.*?)</ul>', index, re.S)
if not row or not re.search(r'<li><a class="door door--[^"]+" href="[^"]+"', row.group(1)):
    refuse('index.html has no <ul class="doors"> of <li><a class="door"> links, and Cel Street builds exactly those.')
elif 'class="door__awning"' not in row.group(1) or 'class="door__name"' not in row.group(1):
    refuse("index.html's doors have lost .door__awning or .door__name, which Cel Street dresses its shops in.")
if not re.search(r'<a class="signpost" href="campgrounds\.html">', index) or 'class="signpost__to"' not in index:
    refuse("index.html has lost its signpost to the campgrounds, which Cel Street stands at the treeline end.")
if not re.search(r'<a class="roadout" href="the-outskirts\.html">', index) or 'class="roadout__to"' not in index:
    refuse("index.html has lost its road out to the Outskirts, which Cel Street stands at the far end.")
if not re.search(r'<a class="liftdown" href="arlesglad-caverns\.html">', index) or 'class="liftdown__to"' not in index:
    refuse("index.html has lost its lift down to the caverns, which Cel Street stands by the stoop.")
for cls, page, part, what in (("noticeboard", "pebble-board.html", "noticeboard__what", "the Pebble Board"),
                              ("brasstacks", "brass-tacks-board.html", "brasstacks__what", "the Brass Tacks Board"),
                              ("postercol", "now-playing.html", "postercol__what", "the Now Playing column")):
    if not re.search(r'<a class="' + cls + r'" href="' + re.escape(page) + '">', index) or f'class="{part}"' not in index:
        refuse(f"index.html has lost {what}, which Cel Street stands on the pavement by the front door.")
if not re.search(r'class="masthead__who".*?<a href="danny-the-street\.html">', index, re.S):
    refuse("index.html's masthead no longer names Danny the Street, whose name Cel Street puts on a plate on the end wall.")

# ── What cel-street.js promises ─────────────────────────────────────────────
js = JS.read_text()
code = re.sub(r"/\*.*?\*/", "", js, flags=re.S)
code = re.sub(r"(?m)^\s*//.*$", "", code)
for selector in ("ul.doors", ":scope > li > a.door", ".door__awning", ".door__name", "a.signpost", ".signpost__to", "a.roadout", ".roadout__to", "a.liftdown", ".liftdown__to", "a.noticeboard", ".noticeboard__what", "a.brasstacks", ".brasstacks__what", "a.postercol", ".postercol__what", '.masthead__who a[href="danny-the-street.html"]'):
    if selector not in code:
        refuse(f"cel-street.js no longer reads {selector!r}; change this tool's list with it, on purpose.")
imports = re.findall(r"^\s*import\b[^;]*?from\s*'([^']+)'", code, re.M)
if imports != ["./vendor/three.module.min.js", "./vendor/CSS3DRenderer.js"]:
    refuse(f"cel-street.js imports {imports}; it imports the vendored three.js and its CSS3D renderer, and nothing else.")
if re.search(r"\bimport\s*\(", code):
    refuse("cel-street.js imports something at runtime.")
for m in re.finditer(r"fetch\(\s*([^,)]+)", code):
    if m.group(1).strip() not in ("'index.html'", "'/cb/avatars'"):
        refuse(f"cel-street.js fetches {m.group(1).strip()}; it reads the front page and, on a press, your avatars, and nothing else.")
if re.search(r"method:\s*'(POST|PUT|DELETE|PATCH)'", code):
    refuse("cel-street.js writes to the server. It only reads.")
avatars = code.find("'/cb/avatars'")
press = code.rfind("addEventListener('click'", 0, avatars)
if avatars != -1 and (press == -1 or code.find("bringMe") > press):
    refuse("cel-street.js asks /cb/avatars outside the Bring my avatar press.")
if re.search(r"localStorage\.(setItem|removeItem|clear)|sessionStorage|indexedDB|document\.cookie", code):
    refuse("cel-street.js writes to storage. The page keeps nothing; familiar.js alone keeps a familiar.")
for key in re.findall(r"localStorage\.getItem\(\s*([^)]+)\)", code):
    if key.strip() not in ("'love-familiar'", "'love-cb'"):
        refuse(f"cel-street.js reads {key.strip()} from storage; it reads your familiar and the radio's pass, and nothing else.")
if not re.search(r'<body[^>]*\bdata-familiar="walks"', (ROOT / "cel-street.html").read_text()):
    refuse('cel-street.html\'s <body> has lost data-familiar="walks", and the familiar would be on the page as well as the street.')
if re.search(r"XMLHttpRequest|sendBeacon|EventSource|WebSocket", code):
    refuse("cel-street.js sends something some other way than fetch.")
if re.search(r"\bset(Interval|Timeout)\b", code):
    refuse("cel-street.js waits on a clock. Nothing on the street moves by itself.")
# WHAT A ROOM LETS MOVE moves only through the kit, and only under the line.
for m in re.finditer(r"requestAnimationFrame\((.{0,40})", code):
    if not re.match(r"\s*(tick|padTick|moveTick|function \(\) \{ ctlSaid)", m.group(1)):
        refuse(f"cel-street.js asks for a frame for {m.group(1).strip()!r}; only walking, a controller, what a room "
               "lets move and a switch's answer do.")
def _num(name):
    m = re.search(r"\b" + name + r"\s*=\s*([0-9.]+)", code)
    if not m:
        refuse(f"cel-street.js has lost {name}, which holds what a room lets move under the flash line.")
    return float(m.group(1))
_hz = re.search(r"\bHZ\s*=\s*\[([0-9., ]+)\]", code)
if not _hz:
    refuse("cel-street.js has lost HZ, the wobbles a candle flickers out of.")
if _num("DIM") > 0.1 or max(float(x) for x in _hz.group(1).split(",")) > 2.5:
    refuse("cel-street.js lets a flame dim by more than a tenth of itself or wobble faster than two and a half "
           "times a second, which is past the line candles.js holds.")
if _num("TWINKLE") < 3 or _num("TURN_MIN") < 1.8:
    refuse("cel-street.js lets a bulb twinkle quicker than once in three seconds or a thing turn quicker than once "
           "in 1.8: the yurt's own lights take 3.4 and her record six.")
if "hasAttribute('data-low')" not in code or "document.hidden" not in code:
    refuse("cel-street.js lets something move in a low-stimulation mode or a hidden tab.")
# IN A HEADSET (Helen's ask, 2026-11-07): the headset asks for a picture every
# frame, so the frames run only while a session is open, set when it opens and
# cleared when it ends; a session is asked for only on a press of Enter VR;
# and nobody is carried along to a place in one, so a glide to a place never
# runs in a headset. A stick walks you only while it is pushed (Ryan's call,
# 2026-11-07, reversing the trial's "no gliding"), at a walking pace, and the
# panel can switch it off for anybody it makes sick.
loops = re.findall(r"setAnimationLoop\(\s*([^)]*?)\s*\)", code)
if sorted(loops) != ["null", "xrFrame"]:
    refuse(f"cel-street.js sets the headset's frames as {loops}; they are xrFrame while a session is open and null when it ends, and nothing else.")
_req = code.find("requestSession(")
if _req != -1 and code.rfind("vrBtn.addEventListener('click'", 0, _req) == -1:
    refuse("cel-street.js asks for a headset outside the Enter VR press.")
if "if (xrOn) { glide = null; vrStand(to); return; }" not in code:
    refuse("cel-street.js no longer stands you at a place in a headset without carrying you there.")
_walk = re.search(r"var VR_WALK = ([0-9.]+)", code)
if not _walk or float(_walk.group(1)) > 1.6:
    refuse(f"cel-street.js walks a headset at {_walk.group(1) if _walk else 'no set pace'} metres a second; a stick walks at a walking pace, 1.6 at most, because speed is what makes a glide sickening.")
if "if (xrGlide && f && dt)" not in code or "xrGlide = !xrGlide" not in code:
    refuse("cel-street.js no longer walks a headset only while a stick is pushed, or the panel has lost the switch that turns stick walking off.")
if not re.search(r'data-cel-vr hidden', PAGE.read_text()):
    refuse("cel-street.html's Enter VR button no longer ships hidden; it shows only where a headset can open the room.")
if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write", code):
    refuse("cel-street.js writes markup from a string. It copies the front page's own elements and builds the rest.")
if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(rgb|hsl)a?\(\s*\d", code):
    refuse("cel-street.js writes a colour in itself. Every colour is read by name out of love.css, "
           "or off the front page's own doors.")

css = CSS.read_text()
root = css[css.index(":root {"):css.index("\n}", css.index(":root {"))]
declared = set(re.findall(r"(--[\w-]+)\s*:", re.sub(r"/\*.*?\*/", " ", root, flags=re.S)))
for name in sorted(set(re.findall(r"'(--cel-[\w-]+)'", code))):
    if name not in declared:
        refuse(f"cel-street.js reads {name}, which love.css's :root does not declare.")

sections = [(m.start(), m.group(0)) for m in re.finditer(r"/\* §\d+ ── [^\n]*", css)]
mine = next((i for i, (_, h) in enumerate(sections) if "Cel Street" in h), None)
if mine is None:
    refuse("love.css has no section for Cel Street.")
else:
    body = css[sections[mine][0]:sections[mine + 1][0]]
    body_code = re.sub(r"/\*.*?\*/", "", body, flags=re.S)
    if re.search(r"@keyframes|\banimation\b|\btransition\b", body_code):
        refuse("love.css's Cel Street section moves something. Nothing on the street moves by itself.")

page = PAGE.read_text()
if '<script type="module" src="cel-street.js"></script>' not in page:
    refuse("cel-street.html no longer loads cel-street.js as a module.")
if "data-cel-doors" not in page:
    refuse("cel-street.html has lost its list of doors, the way in for a keyboard and a screen reader.")
if "three.js" not in page or "MIT" not in page:
    refuse("cel-street.html no longer credits three.js and its licence.")

# ── The rooms you can walk into, each its own file ──────────────────────────
# A ROOM'S FILE IS cel-in-<the room's page>.js AND IS THAT ROOM'S WORLD, the
# walk-*.js rule on Paper Street: it keeps, sends, fetches and times nothing,
# moves nothing by itself, writes no markup and makes no element of its own
# (its page goes up only through the kit's screen(), so every room's page
# arrives the same honest way), and draws only in colours love.css declares,
# by name.
rooms = {}
for f in sorted(ROOT.glob("cel-in-*.js")):
    rpage = f.name[len("cel-in-"):-3] + ".html"
    src = f.read_text()
    c = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    c = re.sub(r"(?m)^\s*//.*$", "", c)
    if not (ROOT / rpage).exists():
        refuse(f"{f.name} is a room for {rpage}, which is not a page on the street.")
    if f"window.loveCelRooms['{rpage}']" not in c:
        refuse(f"{f.name} does not register itself as window.loveCelRooms['{rpage}'].")
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie|\bfetch\b|XMLHttpRequest|sendBeacon|WebSocket|EventSource", c):
        refuse(f"{f.name} keeps or sends something. A room's file only draws its world.")
    if re.search(r"\bset(Interval|Timeout)\b|requestAnimationFrame|\banimation\b", c):
        refuse(f"{f.name} moves something by itself. Nothing on Cel Street does.")
    if re.search(r"innerHTML|outerHTML|insertAdjacentHTML|document\.write|createElement|\bimport\b", c):
        refuse(f"{f.name} writes markup, makes an element or imports something. Its rpage goes up through kit.screen().")
    if "kit.screen(" not in c:
        refuse(f"{f.name} never puts its room's own rpage up with kit.screen().")
    if re.search(r"#[0-9a-fA-F]{3,8}\b|\b(rgb|hsl)a?\(\s*\d", c):
        refuse(f"{f.name} writes a colour in itself. A room draws in the colours love.css declares for it, by name.")
    # A colour a page's own script sets on a drawing (the cabin's strips'
    # --efw-led) is declared on that drawing's rule rather than :root, and a
    # room follows it there with kit.follow(); it is still one love.css names.
    followed = set(re.findall(r"kit\.follow\([^;]*?read\('(--[\w-]+)'\)", c, re.S))
    for name in sorted(set(re.findall(r"'(--[\w-]+)'", c))):
        if name in followed and re.search(r"[^\n{]*\{[^}]*" + re.escape(name) + r"\s*:", css):
            continue
        if name not in declared:
            refuse(f"{f.name} draws in {name}, which love.css's :root does not declare.")
    # A thing it lifts off its page has to be on its page, found by classes
    # (.a.b) so this tool can look; a script it runs against its lifts has to
    # be one its page loads itself.
    page_src = (ROOT / rpage).read_text() if (ROOT / rpage).exists() else ""
    for sel in re.findall(r"kit\.lift\(\s*\w+\s*,\s*'([^']+)'", c):
        classes = re.findall(r"\.([\w-]+)", sel)
        if not classes or re.sub(r"\.[\w-]+", "", sel).strip():
            refuse(f"{f.name} lifts {sel!r}; a room lifts by classes only (.a.b), so this tool can find them.")
            continue
        if not any(all(cl in m.split() for cl in classes) for m in re.findall(r'class="([^"]*)"', page_src)):
            refuse(f"{f.name} lifts {sel} off {rpage}, which has nothing wearing those classes.")
    for src_js in re.findall(r"kit\.wire\(\s*\w+\s*,\s*'([^']+)'", c):
        if f'<script src="{src_js}"' not in page_src:
            refuse(f"{f.name} runs {src_js} against its lifts, and {rpage} does not load {src_js} itself.")
    rooms[rpage] = f.name

# ── The campgrounds' pitches, read off its own board ────────────────────────
# The field on Cel Street stands a post for every pitch on campgrounds.html's
# board, in its order, with its number, its name and where it goes; written
# into cel-in-campgrounds.js between cel:pitches markers, never by hand, so a
# pitch on the board is a post in the field the next run.
CAMP = ROOT / "cel-in-campgrounds.js"
pitches = []
board = (ROOT / "campgrounds.html").read_text()
for m in re.finditer(r'<li class="pitch( [^"]*)?">(.*?)</li>\s*(?=<li class=|</ul>)', board, re.S):
    mods, body = m.group(1) or "", m.group(2)
    no = re.search(r'<span class="pitch__no">([^<]+)</span>', body)
    h3 = re.search(r"<h3>(.*?)</h3>", body, re.S)
    if not no or not h3:
        refuse("a pitch on campgrounds.html's board has no number or no name, and Cel Street letters both on its post.")
        continue
    a = re.search(r'<a href="([^"]+)">(.*?)</a>', h3.group(1), re.S)
    name = re.sub(r"<[^>]+>", "", a.group(2) if a else h3.group(1)).strip()
    name = html.unescape(name)
    state = "summit" if "pitch--summit" in mods else "open" if "pitch--open" in mods else "raising" if "pitch--raising" in mods else ""
    pitches.append({"no": html.unescape(no.group(1)).strip(), "name": name, "page": a.group(1) if a else None, "state": state})
if not pitches:
    refuse("campgrounds.html's board has no pitches Cel Street can read.")
if CAMP.exists():
    camp = CAMP.read_text()
    if "// cel:pitches:begin" not in camp:
        refuse("cel-in-campgrounds.js has lost its cel:pitches markers.")
    else:
        pline = "      var PITCHES = " + json.dumps(pitches, ensure_ascii=False) + ";"
        camp_new = re.sub(r"(// cel:pitches:begin\n).*?(\n\s*// cel:pitches:end)", lambda m: m.group(1) + pline + m.group(2), camp, flags=re.S)
        if camp_new != camp:
            CAMP.write_text(camp_new)

# ── The Outskirts' turnings and the caverns' levels, read off their pages ───
# The road out on Cel Street stands a sign for every turning on
# the-outskirts.html's board, and the caverns open a doorway for every level on
# arlesglad-caverns.html's panel, each in its page's order; written between
# cel:turnings and cel:levels markers, never by hand, so a turning or a level
# on its page is a sign or a doorway in its room the next run.
def board_of(page, li, no_cls, raising_cls, what):
    src = (ROOT / page).read_text()
    out = []
    for m in re.finditer(r'<li class="' + li + r'( [^"]*)?">(.*?)</li>', src, re.S):
        mods, body = m.group(1) or "", m.group(2)
        no = re.search(r'<span class="' + no_cls + r'"[^>]*>([^<]+)</span>', body)
        h3 = re.search(r"<h3>(.*?)</h3>", body, re.S)
        if not no or not h3:
            refuse(f"a {what} on {page} has no number or no name, and Cel Street letters both.")
            continue
        a = re.search(r'<a href="([^"]+)">(.*?)</a>', h3.group(1), re.S)
        name = html.unescape(re.sub(r"<[^>]+>", "", a.group(2) if a else h3.group(1)).strip())
        out.append({"no": html.unescape(no.group(1)).strip(), "name": name, "page": a.group(1) if a else None,
                    "state": "raising" if (raising_cls in mods or not a) else ""})
    if not out:
        refuse(f"{page} has no {what}s Cel Street can read.")
    return out

def write_list(room_file, marker, var, items, indent):
    f = ROOT / room_file
    if not f.exists():
        return
    src = f.read_text()
    if f"// cel:{marker}:begin" not in src:
        refuse(f"{room_file} has lost its cel:{marker} markers.")
        return
    line = indent + "var " + var + " = " + json.dumps(items, ensure_ascii=False) + ";"
    new = re.sub(r"(// cel:" + marker + r":begin\n).*?(\n\s*// cel:" + marker + r":end)", lambda m: m.group(1) + line + m.group(2), src, flags=re.S)
    if new != src:
        f.write_text(new)

write_list("cel-in-the-outskirts.js", "turnings", "TURNINGS",
           board_of("the-outskirts.html", "turning", "turning__no", "turning--raising", "turning"), "  ")
levels = board_of("arlesglad-caverns.html", "cav-stop", "cav-stop__key", "cav-stop--raising", "level")
write_list("cel-in-arlesglad-caverns.js", "levels", "LEVELS",
           [{"key": l["no"], "room": l["name"], "page": l["page"]} for l in levels], "      ")

# Nature's Contribution's fingerpost has an arm for every place on the land,
# read off the page's own post; written between cel:arms markers, never by hand.
write_list("cel-in-natures-contribution.js", "arms", "ARMS",
           board_of("natures-contribution.html", "ncx-arm", "ncx-arm__no", "ncx-arm--raising", "fingerpost arm"), "  ")

# The Pebble Board's room pins a slot for every spread the edition on the
# page has; counted off pebble-board.html and written between cel:spreads
# markers, never by hand, because the board is replaced edition by edition.
spreads = len(re.findall(r'<[a-z]+ class="pb-spread[ "]', (ROOT / "pebble-board.html").read_text()))
if not spreads:
    refuse("pebble-board.html has no spreads the Pebble Board's room on Cel Street can pin.")
else:
    f = ROOT / "cel-in-pebble-board.js"
    if f.exists():
        src = f.read_text()
        if "// cel:spreads:begin" not in src:
            refuse("cel-in-pebble-board.js has lost its cel:spreads markers.")
        else:
            new = re.sub(r"(// cel:spreads:begin\n).*?(\n\s*// cel:spreads:end)", lambda m: m.group(1) + "  var SPREADS = " + str(spreads) + ";" + m.group(2), src, flags=re.S)
            if new != src:
                f.write_text(new)

# Danny the Street's banners: our words in Danny's manner, out of
# data/danny-says.json, onto the street between cel:danny markers in
# cel-street.js and as a list between cel:danny markers in cel-street.html, so
# anybody the picture does not reach reads the same words. Never a line of
# DC's; Danny is they; nothing counted; short enough for a banner.
danny = json.loads((ROOT / "data" / "danny-says.json").read_text()).get("says") or []
if not danny:
    refuse("data/danny-says.json says nothing, and Cel Street hangs Danny's banners from it.")
for line in danny:
    if len(line) > 36:
        refuse(f"Danny's banner {line!r} is longer than 36 characters, too long to read across the road.")
    if re.search(r"\b(he|him|his|himself)\b", line, re.I):
        refuse(f"Danny's banner {line!r} calls Danny he. Danny is they here.")
    if re.search(r"\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|hundred|dozen)\b", line, re.I):
        refuse(f"Danny's banner {line!r} counts something. Nothing on the street does.")
write_list("cel-street.js", "danny", "DANNY_SAYS", danny, "  ")
page_src = PAGE.read_text()
if "<!-- cel:danny:begin -->" not in page_src:
    refuse("cel-street.html has lost its cel:danny markers, where Danny's banners are written out in words.")
else:
    items = "\n".join("      <li>" + html.escape(l) + "</li>" for l in danny)
    new = re.sub(r"(<!-- cel:danny:begin -->\n).*?(<!-- cel:danny:end -->)", lambda m: m.group(1) + items + "\n" + m.group(2), page_src, flags=re.S)
    if new != page_src:
        PAGE.write_text(new)

# The Jungle Room's path hangs a leaf for every gallery of cams on its page,
# counted off jungle-room.html and written between cel:galleries markers,
# never by hand. Its path has room for eight before its far end, the log and
# the door down to the Den; a ninth needs the room made longer first.
galleries = len(re.findall(r'<section class="gallery"', (ROOT / "jungle-room.html").read_text()))
if not galleries:
    refuse("jungle-room.html has no galleries the Jungle Room on Cel Street can hang.")
elif galleries > 8:
    refuse(f"jungle-room.html has {galleries} galleries, and the Jungle Room's path on Cel Street has room "
           "for eight. Make the room longer in cel-in-jungle-room.js, then raise this.")
else:
    f = ROOT / "cel-in-jungle-room.js"
    src = f.read_text()
    if "// cel:galleries:begin" not in src:
        refuse("cel-in-jungle-room.js has lost its cel:galleries markers.")
    else:
        new = re.sub(r"(// cel:galleries:begin\n).*?(\n\s*// cel:galleries:end)",
                     lambda m: m.group(1) + "  var GALLERY_SLOTS = " + str(galleries) + ";" + m.group(2), src, flags=re.S)
        if new != src:
            f.write_text(new)

# The World room hangs a garden for every part of the Map its directory has,
# with that part's heading; written between cel:parts markers, never by hand.
# Its gardens stand in pairs down both sides in three rows before the web, so a
# part past those is refused until the room is laid out for it.
world_parts = [html.unescape(re.sub(r"<[^>]+>", "", h)).strip()
               for h in re.findall(r'<h2 class="www-cat__h"[^>]*>(.*?)</h2>', (ROOT / "world.html").read_text(), re.S)]
if not world_parts:
    refuse("world.html's directory has no parts the World room on Cel Street can read.")
elif len(world_parts) > 6:
    refuse("world.html's directory has more parts than the World room on Cel Street has gardens for; lay the room out for them.")
write_list("cel-in-world.js", "parts", "PARTS", world_parts, "      ")

# ── A Quiet Pint's plan, worked out by the pub's own tool ───────────────────
# The pub on Cel Street is stood up from the same plan its page draws, so the
# numbers are worked out here by make-a-quiet-pint.py's own functions out of
# data/a-quiet-pint.json and written into cel-in-a-quiet-pint.js between
# cel:plan markers, never by hand, so the two cannot disagree.
PINT = ROOT / "cel-in-a-quiet-pint.js"
if PINT.exists():
    import importlib.util
    spec = importlib.util.spec_from_file_location("aqp_tool", ROOT / "tools" / "make-a-quiet-pint.py")
    aqp = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(aqp)
    d = json.loads((ROOT / "data" / "a-quiet-pint.json").read_text())
    aqp.setup(d)
    r1 = lambda v: round(v, 1)
    plan = {
        "room": d["room"], "door": {k: d["door"][k] for k in ("x0", "x1", "top")},
        "steps": d["steps"], "ramp": {"width": d["ramp"]["width"], "runs": d["ramp"]["runs"], "landing": d["ramp"]["landing"]},
        "beams": d["beams"], "fans": d["fans"], "windows": d["windows"],
        "mirrors": [{k: x[k] for k in ("wall", "at", "z", "w", "h")} for x in d["mirrors"]],
        "patches": [[1 if kind == "table" else 0, r1(z), [[r1(a), r1(b)] for a, b in pts]] for (_, kind, _t, pts, z) in aqp.patches(d)],
        "bar": {"front": d["bar"]["front"], "depth": d["bar"]["depth"], "heights": d["bar"]["heights"],
                "stools": [[r1(x + 15), r1(y)] for x, y, _ in (aqp.arc_point(d["bar"]["front"], a) for a in d["bar"]["stools"])]},
        "stove": d["stove"], "piano": d["piano"],
        "columns": [{k: c[k] for k in ("key", "x", "y", "d", "bands")} for c in d["columns"]],
        "tables": [],
    }
    for t in d["tables"]:
        tt = {k: t[k] for k in ("n", "shape", "w", "h", "top", "base", "seating", "x", "y") if k in t}
        if "d" in t: tt["d"] = t["d"]
        if "against" in t: tt["against"] = t["against"]
        tt["seats"] = [[r1(x), r1(y)] for x, y in aqp.seat_spots(t, d["room"])]
        plan["tables"].append(tt)
    pint = PINT.read_text()
    if "// cel:plan:begin" not in pint:
        refuse("cel-in-a-quiet-pint.js has lost its cel:plan markers.")
    else:
        pline = "      var PLAN = " + json.dumps(plan, ensure_ascii=False, separators=(",", ":")) + ";"
        pint_new = re.sub(r"(// cel:plan:begin\n).*?(\n\s*// cel:plan:end)", lambda m: m.group(1) + pline + m.group(2), pint, flags=re.S)
        if pint_new != pint:
            PINT.write_text(pint_new)

# ── Coping's doors, out of the room's own data ──────────────────────────────
# The eye on Cel Street stands the page's doors under the page's moments, so
# which room each door opens onto, and its name, are written into
# cel-in-coping.js between cel:doors markers out of data/coping.json (the
# names off cb-rooms.json, each page's own title), never by hand.
COPE = ROOT / "cel-in-coping.js"
if COPE.exists():
    cdata = json.loads((ROOT / "data" / "coping.json").read_text())
    cnames = {r["path"].lstrip("/"): r["name"] for r in json.loads((ROOT / "cb-rooms.json").read_text())["rooms"]}
    cdoors, cmoments = [], []
    for i, g in enumerate(cdata["doors"]):
        cmoments.append(g["moment"])
        row = []
        for door in g["doors"]:
            if door["page"] not in cnames:
                refuse(f"Coping's door to {door['page']} names a page the room list does not know.")
                continue
            row.append([door["page"], cnames[door["page"]]])
        cdoors.append({"moment": i, "doors": row})
    cope = COPE.read_text()
    if "// cel:doors:begin" not in cope:
        refuse("cel-in-coping.js has lost its cel:doors markers.")
    else:
        dl = ("      var DOORS = " + json.dumps(cdoors, ensure_ascii=False) + ";\n"
              + "      var MOMENTS = " + json.dumps(cmoments, ensure_ascii=False) + ";")
        cope_new = re.sub(r"(// cel:doors:begin\n).*?(\n\s*// cel:doors:end)", lambda m: m.group(1) + dl + m.group(2), cope, flags=re.S)
        if cope_new != cope:
            COPE.write_text(cope_new)

# ── Volunteers' bands, out of the room's own help list ─────────────────────
# The loom on Cel Street weaves the page's cloth, a band for every thing on the
# help list in its dye and its order, written into cel-in-volunteers.js between
# cel:bands markers out of data/volunteers.json, never by hand.
VOLS = ROOT / "cel-in-volunteers.js"
if VOLS.exists():
    bands = ["--vol-" + h["dye"] for h in json.loads((ROOT / "data" / "volunteers.json").read_text())["help"]]
    vols = VOLS.read_text()
    if "// cel:bands:begin" not in vols:
        refuse("cel-in-volunteers.js has lost its cel:bands markers.")
    else:
        bl = "      var BANDS = " + json.dumps(bands) + ";"
        vols_new = re.sub(r"(// cel:bands:begin\n).*?(\n\s*// cel:bands:end)", lambda m: m.group(1) + bl + m.group(2), vols, flags=re.S)
        if vols_new != vols:
            VOLS.write_text(vols_new)

# ── The Source's springs, read off its own page ─────────────────────────────
# The hill on Cel Street holds a pool for every pool on the-source.html, in the
# page's order, with its name and the side of the hill it steps to, written
# into cel-in-the-source.js between cel:springs markers, never by hand, so a
# repository the page grows a pool for is a pool on the hill the next run.
SRC = ROOT / "cel-in-the-source.js"
if SRC.exists():
    springs = [{"name": html.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip(), "far": bool(m.group(1))}
               for m in re.finditer(r'<section class="pool( pool--far)?"[^>]*>\s*<h2 class="pool__name"[^>]*>(.*?)</h2>',
                                    (ROOT / "the-source.html").read_text(), re.S)]
    src = SRC.read_text()
    if "// cel:springs:begin" not in src:
        refuse("cel-in-the-source.js has lost its cel:springs markers.")
    elif not springs:
        refuse("the-source.html has no pool for cel-in-the-source.js to find.")
    else:
        sl = "      var SPRINGS = " + json.dumps(springs, ensure_ascii=False) + ";"
        src_new = re.sub(r"(// cel:springs:begin\n).*?(\n\s*// cel:springs:end)", lambda m: m.group(1) + sl + m.group(2), src, flags=re.S)
        if src_new != src:
            SRC.write_text(src_new)

if problems:
    print("REFUSING:\n  " + "\n  ".join(problems))
    sys.exit(2)

line = "  var ROOMS = {" + ", ".join(f"'{k}': '{v}'" for k, v in sorted(rooms.items())) + "};"
# Each room's name, for the teleporter: the name its own file gives itself, or
# else its page's title, so jumping to a room needs no request.
def room_name(rpage, fname):
    m = re.search(r"loveCelRooms\[[^\]]+\]\s*=\s*\{\s*name:\s*'((?:[^'\\]|\\.)*)'", (ROOT / fname).read_text())
    if m:
        return m.group(1).replace("\\'", "'")
    t = re.search(r"<title>(.*?)</title>", (ROOT / rpage).read_text(), re.S)
    return html.unescape(t.group(1)).split(" \u2014 ")[0].strip() if t else rpage
line += "\n  var NAMES = " + json.dumps({k: room_name(k, v) for k, v in sorted(rooms.items())}, ensure_ascii=False) + ";"
js_new = re.sub(r"(// cel:rooms:begin\n).*?(\n\s*// cel:rooms:end)", lambda m: m.group(1) + line + m.group(2), js, flags=re.S)
if "// cel:rooms:begin" not in js:
    print("REFUSING: cel-street.js has lost its cel:rooms markers.")
    sys.exit(2)
if js_new != js:
    JS.write_text(js_new)

# ── The picture over the name ────────────────────────────────────────────────
# The street in the sun, side on: sky going pale to the haze, two cumulus, the
# hills, a row of apartment blocks with shops on their ground floors in the
# street's own door colours and solar panels on every roof, and two poles in
# front with the wires sagging between them. Every edge inked. Seeded, so the
# picture is the same every run.
rnd = random.Random(31)
W, H = 1200, 420
out = [f'<svg class="cel-sky" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">',
       '<defs><linearGradient id="cel-sky-g" x1="0" y1="0" x2="0" y2="1">'
       '<stop offset="0" style="stop-color: var(--cel-sky)"/><stop offset="1" style="stop-color: var(--cel-haze)"/>'
       '</linearGradient></defs>',
       f'<rect width="{W}" height="{H}" fill="url(#cel-sky-g)"/>']
INK = 'stroke="var(--cel-ink)" stroke-linejoin="round"'


def cloud(cx, cy, s):
    puffs = [(0, 0, 1.0), (-0.9, 0.25, 0.7), (0.95, 0.2, 0.75), (-0.4, -0.45, 0.65), (0.45, -0.5, 0.7), (1.6, 0.45, 0.5), (-1.55, 0.5, 0.5)]
    for dx, dy, r in puffs:
        out.append(f'<circle cx="{cx + dx * s:.1f}" cy="{cy + dy * s:.1f}" r="{r * s:.1f}" fill="var(--cel-cloud)"/>')
    out.append(f'<ellipse cx="{cx:.1f}" cy="{cy + 0.62 * s:.1f}" rx="{1.9 * s:.1f}" ry="{0.32 * s:.1f}" fill="var(--cel-cloud-shade)"/>')


cloud(250, 95, 58)
cloud(860, 70, 74)
out.append(f'<path d="M0 300 Q160 238 330 286 T700 270 T1200 262 V{H} H0 Z" fill="var(--cel-hill)"/>')

SHOPS = ["--hot", "--cyan", "--yellow", "--green", "--violet", "--orange"]
WALLS = ["--cel-wall-1", "--cel-wall-2", "--cel-wall-3", "--cel-wall-4"]
x, k, base = -20, 0, 372
while x < W:
    w = rnd.choice([118, 136, 152, 170])
    h = rnd.choice([150, 182, 214, 246])
    top = base - h
    wall = WALLS[k % len(WALLS)]
    out.append(f'<rect x="{x}" y="{top}" width="{w}" height="{h}" fill="var({wall})" {INK} stroke-width="3"/>')
    # Solar panels on the roof, tipped toward the sun.
    for p in range(max(1, (w - 16) // 30)):
        px = x + 10 + p * 30
        out.append(f'<path d="M{px} {top - 3} L{px + 8} {top - 15} L{px + 30} {top - 15} L{px + 22} {top - 3} Z" fill="var(--cel-panel)" stroke="var(--cel-frame)" stroke-width="1.6"/>')
    # Windows, floor by floor.
    for fy in range(top + 18, base - 70, 34):
        for fx in range(x + 12, x + w - 30, 34):
            out.append(f'<rect x="{fx}" y="{fy}" width="20" height="22" fill="var(--cel-glass)" stroke="var(--cel-frame)" stroke-width="2.5"/>')
            out.append(f'<path d="M{fx + 5} {fy + 19} L{fx + 11} {fy + 3}" stroke="var(--cel-glint)" stroke-width="3"/>')
    # The shop on the ground floor, in one of the street's own door colours,
    # with a striped awning over it.
    shop = SHOPS[k % len(SHOPS)]
    out.append(f'<rect x="{x + 6}" y="{base - 52}" width="{w - 12}" height="52" fill="var({shop})" {INK} stroke-width="3"/>')
    out.append(f'<rect x="{x + 22}" y="{base - 36}" width="{w - 44}" height="30" fill="var(--cel-glass)" {INK} stroke-width="2"/>')
    out.append(f'<path d="M{x + 2} {base - 52} L{x + 10} {base - 66} L{x + w - 10} {base - 66} L{x + w - 2} {base - 52} Z" fill="var(--cel-cloud)" {INK} stroke-width="3"/>')
    for sx in range(x + 10, x + w - 14, 16):
        out.append(f'<path d="M{sx} {base - 66} L{sx + 8} {base - 66} L{sx + 6} {base - 52} L{sx - 3} {base - 52} Z" fill="var({shop})"/>')
    x += w
    k += 1

out.append(f'<rect y="{base}" width="{W}" height="18" fill="var(--cel-walk)" {INK} stroke-width="3"/>')
out.append(f'<rect y="{base + 18}" width="{W}" height="{H - base - 18}" fill="var(--cel-road)"/>')
for dx in range(20, W, 90):
    out.append(f'<rect x="{dx}" y="{base + 30}" width="46" height="5" fill="var(--cel-paint)"/>')

poles = [150, 640, 1110]
for px in poles:
    out.append(f'<rect x="{px - 7}" y="60" width="14" height="{base - 60 + 10}" fill="var(--cel-pole)" {INK} stroke-width="3"/>')
    out.append(f'<rect x="{px - 46}" y="76" width="92" height="9" fill="var(--cel-pole)" {INK} stroke-width="2.5"/>')
    out.append(f'<rect x="{px - 30}" y="112" width="60" height="8" fill="var(--cel-pole)" {INK} stroke-width="2.5"/>')
    out.append(f'<rect x="{px + 9}" y="140" width="24" height="34" rx="5" fill="var(--cel-frame)" {INK} stroke-width="2.5"/>')
for a, b in zip(poles, poles[1:]):
    for i, (o, y, sag) in enumerate([(-40, 74, 46), (-14, 74, 52), (14, 74, 58), (40, 74, 50), (-26, 112, 70), (24, 112, 64), (0, 150, 80)]):
        mid = (a + b) / 2
        out.append(f'<path d="M{a + o} {y} Q{mid} {y + sag * 2} {b + o} {y}" fill="none" stroke="var(--cel-wire)" stroke-width="{2.6 if i < 4 else 3.6}"/>')
out.append(f'<path d="M{poles[0] - 40} 74 Q60 140 -10 120" fill="none" stroke="var(--cel-wire)" stroke-width="2.6"/>')
out.append(f'<path d="M{poles[-1] + 40} 74 Q1170 132 1210 116" fill="none" stroke="var(--cel-wire)" stroke-width="2.6"/>')
out.append('</svg>')
svg = "".join(out)

new = re.sub(r"(<!-- cel:sky:begin -->).*?(<!-- cel:sky:end -->)",
             lambda m: m.group(1) + "\n    " + svg + "\n    " + m.group(2), page, flags=re.S)
if "<!-- cel:sky:begin -->" not in page:
    print("REFUSING: cel-street.html has lost its cel:sky markers.")
    sys.exit(2)
if new != page:
    PAGE.write_text(new)
print(f"cel street: three.js {VERSION} pinned, rooms you can walk into: {', '.join(sorted(rooms)) or 'none'}, the street in the sun drawn, the script holds its promises")
