#!/usr/bin/env python3
"""Draw the member map's world, and hold the member map to what it and
privacy.html say.

Ryan's brief, 2026-10-22: "Let's move the member map off of Google into S.W."
The map hangs on the Community Center's wall, a pull-down wall map in that
room's paint, and stimpunks.org's Individuals page shows the same map as an
image served from here, in place of its Google My Maps embed.

WHAT IT WRITES, from data/world-land.json (Natural Earth's land, public
domain, simplified by tools/pull-world-land.py):

  · netlify/cb/world.mjs, whole: the Equal Earth projection, the frame the
    map is drawn in, and the land as one SVG path. lib.mjs projects every
    place with it, so a pin and the land are placed by the same arithmetic.
  · the map's <svg> in community-center.html, between the membermap:world
    markers, the land in the room's own classes; member-map.js adds the pins.
  · member-map-detail.json, whole, from data/world-detail.json: the land
    again, finer, and the lakes, the borders between countries and the lines
    between states, projected the same way. The wall asks for it only when
    somebody zooms in (Ryan's question, 2026-10-23: "Can I zoom in on this
    map?"), so the map everybody sees first is no heavier for it.

Never hand-edit either. The projection is written once here in Python, for
the land, and once in world.mjs, for the pins; this tool runs both on the
same points and refuses if they disagree.

WHAT IT REFUSES, because a friendly edit could break each without a test
noticing (netlify/cb/lib.test.mjs tests what the code does):

  · A NAME ON THE MAP. The map keeps places, one entry for each member who
    gave a place, and how many are in each place is shown (Ryan's call,
    2026-10-22: "We like knowing how many folks are in each place"). A pin
    holds an id, a place, a country, a latitude and a longitude, and for one
    brought from Google its key, and nothing else; what anybody is shown is
    every place once with how many, never an id. Which join request a pin
    came from is kept on the case, sealed in the office.
  · ANYBODY BUT THE OFFICE'S READERS putting a pin on the map or taking one
    off: every function that writes asks officeAllow first.
  · A LOOKUP THAT SENDS MORE THAN A PLACE'S WORDS, or goes anywhere but
    OpenStreetMap's Nominatim, from the server, at a director's press.
  · MAP TILES, or a page asking anybody but this site for anything:
    member-map.js asks /cb/member-map and, once somebody zooms, the detail
    file, and nothing else, and builds the pins, the list and the detail from
    nodes, never from markup in a string.
  · A MAP THAT MOVES BY ITSELF. It zooms and moves only when somebody presses
    or drags it, and it jumps there rather than gliding, at every setting of
    the dial: no animation, transition, timer or animation frame moves it.
  · ZOOM WITHOUT A WAY BACK OR A WAY IN BY KEYBOARD: the buttons that zoom,
    move and show the whole world again are on the page, words and all, and
    nothing about zooming is only a gesture.
  · THE CREDITS GONE: Natural Earth's for the world and OpenStreetMap's for
    the places, on the map; privacy.html's member map section; and the
    Mission saying the street counts people here.

IF THIS REFUSES: fix the cause. Do not widen a list to make it quiet.
"""
import json
import math
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LAND = ROOT / "data" / "world-land.json"
DETAIL = ROOT / "data" / "world-detail.json"
DETAIL_OUT = ROOT / "member-map-detail.json"
DETAIL_URL = "/member-map-detail.json"
WORLD = ROOT / "netlify" / "cb" / "world.mjs"
PAGE = ROOT / "community-center.html"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
FN = ROOT / "netlify" / "functions" / "cb-member-map.mjs"
JS = ROOT / "member-map.js"
PRIVACY = ROOT / "privacy.html"
MISSION = ROOT / "mission.html"

WIDTH = 1000.0
TOP, BOTTOM = 84.0, -57.0     # the latitudes the frame runs between; Antarctica is left off
A1, A2, A3, A4 = 1.340264, -0.081106, 0.000893, 0.003796
M = math.sqrt(3) / 2

BEGIN = "<!-- membermap:world:begin -- written by tools/make-member-map.py from data/world-land.json. Do not hand-edit. -->"
END = "<!-- membermap:world:end -->"

problems = []


def equal_earth(lat, lon):
    phi, lam = math.radians(lat), math.radians(lon)
    th = math.asin(M * math.sin(phi))
    t2 = th * th
    t6 = t2 * t2 * t2
    x = lam * math.cos(th) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)))
    y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2))
    return x, y


XMAX = equal_earth(0, 180)[0]
YTOP = equal_earth(TOP, 0)[1]
SCALE = WIDTH / (2 * XMAX)
HEIGHT = round((YTOP - equal_earth(BOTTOM, 0)[1]) * SCALE, 1)


def project(lat, lon):
    x, y = equal_earth(lat, lon)
    return round((x + XMAX) * SCALE, 1), round((YTOP - y) * SCALE, 1)


def num(v):
    s = f"{v:.1f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def land_path(rings, close=True):
    """Every ring (or line, unclosed) as one subpath, relative after its first
    point, which keeps the path short without losing the tenth of a unit it is
    drawn to."""
    out = []
    for ring in rings:
        pts = [project(lat, lon) for lon, lat in ring]
        x0, y0 = pts[0]
        parts = [f"M{num(x0)} {num(y0)}"]
        px, py = x0, y0
        for x, y in pts[1:]:
            dx, dy = round(x - px, 1), round(y - py, 1)
            if dx == 0 and dy == 0:
                continue
            parts.append(f"l{num(dx)} {num(dy)}")
            px, py = px + dx, py + dy
        if len(parts) > 1 or close:
            out.append("".join(parts) + ("z" if close else ""))
    return "".join(out)


def detail_module(d):
    """The zoomed-in world as paths, for member-map.js to put in the map."""
    land = [ring for poly in d.get("land", []) for ring in poly]
    out = {
        "_what": "Written by tools/make-member-map.py from data/world-detail.json. Do not hand-edit. The member map zoomed in: Natural Earth's 1:50m land, lakes, borders and state lines (public domain), as paths in the map's own frame, which the Community Center's wall asks for only when somebody zooms.",
        "land": land_path(land),
        "lakes": land_path(d.get("lakes", [])),
        "borders": land_path(d.get("borders", []), close=False),
        "states": land_path(d.get("states", []), close=False),
    }
    return json.dumps(out, separators=(",", ":"), ensure_ascii=False) + "\n"


def world_module(path):
    return f"""/* world.mjs -- written by tools/make-member-map.py from data/world-land.json. Do not hand-edit.

   The member map's world: Natural Earth's land (public domain, version
   5.1.2), in the Equal Earth projection, drawn {num(WIDTH)} wide and {num(HEIGHT)} high,
   from latitude {num(TOP)} down to {num(BOTTOM)}. lib.mjs places every pin with project(),
   which is the same arithmetic the tool drew the land with, and the tool
   checks the two agree. */
export const WORLD_W = {num(WIDTH)};
export const WORLD_H = {num(HEIGHT)};
const A1 = {A1}, A2 = {A2}, A3 = {A3}, A4 = {A4}, M = Math.sqrt(3) / 2;
const XMAX = {XMAX!r}, YTOP = {YTOP!r}, SCALE = {SCALE!r};

/* A latitude and longitude, in degrees, as a point on the map. */
export function project(lat, lon) {{
  const phi = lat * Math.PI / 180, lam = lon * Math.PI / 180;
  const th = Math.asin(M * Math.sin(phi)), t2 = th * th, t6 = t2 * t2 * t2;
  const x = lam * Math.cos(th) / (M * (A1 + 3 * A2 * t2 + t6 * (7 * A3 + 9 * A4 * t2)));
  const y = th * (A1 + A2 * t2 + t6 * (A3 + A4 * t2));
  return {{ x: Math.round((x + XMAX) * SCALE * 10) / 10, y: Math.round((YTOP - y) * SCALE * 10) / 10 }};
}}

export const LAND = '{path}';
"""


def page_svg(path):
    return (BEGIN + "\n"
            + f'<svg class="ctr-map__world" viewBox="0 0 {num(WIDTH)} {num(HEIGHT)}" aria-hidden="true" focusable="false">'
            + f'<path class="ctr-map__land" d="{path}" data-member-land/><g class="ctr-map__fine" data-member-fine></g>'
            + '<g class="ctr-map__pins" data-member-pins></g></svg>\n'
            + END)


def code_of(text):
    c = re.sub(r"/\*.*?\*/", " ", text, flags=re.S)
    return re.sub(r"(?m)^\s*//[^\n]*", " ", c)


def fn(src, name):
    m = re.search(rf"export (?:async )?function {name}\(.*?\n\}}", src, re.S)
    return m.group(0) if m else ""


def check_projection():
    """The JS projection and this one, on the same points."""
    samples = [(52.48, -1.89), (30.27, -97.74), (-33.87, 151.21), (64.84, 14.0), (0, 0), (TOP, 180), (BOTTOM, -180)]
    js = ("import { project } from './netlify/cb/world.mjs';"
          f"console.log(JSON.stringify({json.dumps(samples)}.map(([a, b]) => project(a, b))));")
    try:
        out = subprocess.run(["node", "--input-type=module", "-e", js], cwd=ROOT, capture_output=True, text=True, timeout=30)
        got = json.loads(out.stdout)
    except Exception as e:
        problems.append(f"{WORLD.name}: its projection could not be run ({e}).")
        return
    for (lat, lon), g in zip(samples, got):
        x, y = project(lat, lon)
        if abs(g["x"] - x) > 0.11 or abs(g["y"] - y) > 0.11:
            problems.append(f"{WORLD.name}: project({lat}, {lon}) is {g}, the land's arithmetic says {x}, {y}. A pin would land beside its place.")


def check_lib():
    lib = LIB.read_text()
    start = lib.find("/* ── The member map ──")
    end = lib.find("\n/* ── ", start + 10)
    sec = lib[start:end] if 0 <= start < end else ""
    if not sec:
        problems.append(f"{LIB.name}: the member map's section is missing.")
        return
    code = code_of(sec)
    if "console." in code:
        problems.append(f"{LIB.name}: the member map writes to the console. Nothing about anybody is ever logged.")
    for name in ("mapFind", "mapPut", "mapTake", "mapTakeOne", "importMap", "officeMemberMap"):
        body = fn(sec, name)
        first = re.search(r"\{\n\s*(.*)", body)
        if not body:
            problems.append(f"{LIB.name}: {name} is missing.")
        elif not first or "if (!officeAllow(who))" not in first.group(1):
            problems.append(f"{LIB.name}: {name} must refuse anybody the office does not let in, before it reads or does anything.")
    # A pin is a place, never a person.
    for rec in re.findall(r"saved = \{(.*?)\};", sec):
        keys = {k.split(":")[0].strip().lstrip(".") for k in re.split(r",\s*", rec)}
        if keys - {"id", "...at", "at", "key", "from", "place", "country", "lat", "lon"}:
            problems.append(f"{LIB.name}: a pin is kept with {', '.join(sorted(keys))}. A pin holds an id, a place, a country, a latitude and a longitude (and a key for one from Google), and nothing about anybody.")
    gp = (re.search(r"export function groupPins\(.*?\n\}", sec, re.S) or [""])[0]
    if "id:" in gp or "key" in gp:
        problems.append(f"{LIB.name}: groupPins shows a pin's id or key. What anybody is shown is every place once, with how many.")
    mm = fn(sec, "memberMap")
    if not mm or "groupPins(" not in mm:
        problems.append(f"{LIB.name}: memberMap must show places grouped, every place once with how many.")
    # The lookup sends only a place's words, to Nominatim, and nothing else.
    mf = fn(sec, "mapFind")
    if "MAP_SEARCH" not in mf or re.search(r"\b(email|contact|first|last|handle|who\.)\b", mf.split("const url")[1].split(";")[0] if "const url" in mf else ""):
        problems.append(f"{LIB.name}: mapFind sends more than a place's words, or somewhere other than OpenStreetMap's Nominatim.")
    if "const MAP_SEARCH = 'https://nominatim.openstreetmap.org/search';" not in sec:
        problems.append(f"{LIB.name}: the member map looks places up somewhere other than OpenStreetMap's Nominatim, which privacy.html names.")
    rc = fn(lib, "removeCase")
    if "dropPin(gone.pin" not in rc:
        problems.append(f"{LIB.name}: deleting a case must take its pin off the member map (removeCase).")


def check_function():
    if not FN.exists():
        problems.append(f"{FN.name}: missing. The map's places and its image are served by it.")
        return
    f = code_of(FN.read_text())
    if "'/cb/member-map'" not in f or "'/cb/member-map.svg'" not in f or "method: ['GET']" not in f:
        problems.append(f"{FN.name}: it answers GET at /cb/member-map and /cb/member-map.svg, and nothing else.")
    if "memberMap(" not in f or "readMemberMap(" in f:
        problems.append(f"{FN.name}: it serves the places grouped (memberMap), never the pins themselves.")
    if "OpenStreetMap" not in f or "Natural Earth" not in f:
        problems.append(f"{FN.name}: the map's image must credit Natural Earth and OpenStreetMap.")


def check_js():
    if not JS.exists():
        problems.append(f"{JS.name}: missing.")
        return
    js = code_of(JS.read_text())
    for bad in ("innerHTML", "outerHTML", "insertAdjacentHTML", "document.write", "DOMParser", "createContextualFragment"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The pins and the list are built from nodes, never from markup in a string.")
    urls = set(re.findall(r"fetch\(\s*['\"]([^'\"]+)['\"]", js))
    if urls != {"/cb/member-map", DETAIL_URL} or len(re.findall(r"\bfetch\(", js)) != 2 or re.search(r"https?://", js.replace("http://www.w3.org/2000/svg", "")):
        problems.append(f"{JS.name}: it asks {sorted(urls) or 'nothing'}; it asks /cb/member-map and {DETAIL_URL}, once each, and nothing else, and no other site.")
    for bad in ("requestAnimationFrame", "setInterval", "setTimeout", ".animate(", "scrollIntoView"):
        if bad in js:
            problems.append(f"{JS.name}: {bad}. The map moves only when somebody presses or drags it, and it jumps there rather than gliding.")
    for need, what in (("z === 'in'", "Zoom in"), ("z === 'out'", "Zoom out"), ("z === 'world'", "Whole world"),
                       ("addEventListener('dblclick'", "a double press"), ("addEventListener('wheel'", "Ctrl or Cmd with the scroll wheel"),
                       ("addEventListener('pointerdown'", "a drag or a pinch")):
        if need not in js:
            problems.append(f"{JS.name}: it no longer answers {what}. The map zooms by its buttons, a double press, a pinch and Ctrl or Cmd with the scroll wheel.")
    if re.search(r"localStorage|sessionStorage|indexedDB|document\.cookie", js):
        problems.append(f"{JS.name}: it keeps something in the browser. The map keeps nothing there.")


def check_page(text):
    if "data-member-list" not in text or 'src="member-map.js"' not in text:
        problems.append(f"{PAGE.name}: the member map needs its list of places and member-map.js.")
    strip = re.search(r'<div class="ctr-map__zoom"[^>]*data-member-zoom[^>]*>(.*?)data-member-here', text, re.S)
    if not strip or " hidden" not in strip.group(0).split(">")[0]:
        problems.append(f"{PAGE.name}: the member map's zoom buttons (data-member-zoom) are missing, or not shipped hidden for a page without scripts.")
    else:
        for z, words in (('data-zoom="in"', "Zoom in"), ('data-zoom="out"', "Zoom out"), ('data-zoom="world"', "Whole world")):
            if not re.search(rf'<button type="button"[^>]*{z}[^>]*>\s*{words}\s*</button>', strip.group(1)):
                problems.append(f"{PAGE.name}: the member map's {words} button is missing or has lost its words.")
        for d in ("west", "north", "south", "east"):
            if f'data-pan="{d}"' not in strip.group(1):
                problems.append(f"{PAGE.name}: the member map's button moving it {d} is missing; moving the map is not only a drag.")
    for need, what in (("Natural Earth", "Natural Earth's credit for the world"), ("OpenStreetMap contributors", "OpenStreetMap's credit for the places"),
                       ("privacy.html#member-map", "a link to what the map keeps")):
        if need not in text:
            problems.append(f"{PAGE.name}: the member map is missing {what}.")


def check_words():
    p = PRIVACY.read_text()
    if 'id="member-map"' not in p:
        problems.append(f"{PRIVACY.name}: the member map's section (id member-map) is missing. The map is not published without it.")
    if "member map" not in MISSION.read_text():
        problems.append(f"{MISSION.name}: the Mission no longer says the street counts people on the member map.")


def main():
    data = json.loads(LAND.read_text())
    rings = data.get("rings") or []
    if not rings:
        problems.append(f"{LAND.name}: no land. Run tools/pull-world-land.py.")
        return report()
    path = land_path(rings)
    module = world_module(path)
    if not WORLD.exists() or WORLD.read_text() != module:
        WORLD.write_text(module)
    page = PAGE.read_text()
    pat = re.compile(re.escape(BEGIN) + r".*?" + re.escape(END), re.S)
    if len(pat.findall(page)) != 1:
        problems.append(f"{PAGE.name}: the membermap:world markers must be there exactly once.")
    else:
        new = pat.sub(lambda m: page_svg(path), page)
        if new != page:
            PAGE.write_text(new)
            page = new
    if not DETAIL.exists():
        problems.append(f"{DETAIL.name}: missing. Run tools/pull-world-land.py.")
    else:
        dm = detail_module(json.loads(DETAIL.read_text()))
        if not DETAIL_OUT.exists() or DETAIL_OUT.read_text() != dm:
            DETAIL_OUT.write_text(dm)
    check_projection()
    check_lib()
    check_function()
    check_js()
    check_page(page)
    check_words()
    return report()


def report():
    if problems:
        print("REFUSING:")
        for p in problems:
            print("  " + p)
        return 1
    print("member map: the world drawn and projected one way, places and how many in each and no names, the office alone putting pins on it, zoom by buttons as well as hands, and nothing fetched but our own.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
