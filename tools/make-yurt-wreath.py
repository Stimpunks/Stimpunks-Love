#!/usr/bin/env python3
"""The wreath on the Faery Yurt's door, dressed for the Wheel of the Year.

Helen Edgar's ask, 2026-11-11, out of a list of what her yurt could still
have: "The Wheel of the Year. Your moon calendar already works out the sky.
The yurt could put out decorations for the sabbat nearest today's date. They
would change with the date and nothing would move by itself." Its data is
data/yurt-wreath.json.

ONE WREATH, TWO PLACES, AND THE DATE DECIDES IT. It writes:

  * faery-yurt.html, between yurt-wreath markers, in the By the door row: the
    wreath drawn once with all eight dressings on it, each a group shipped
    hidden (aria-hidden, a picture only), and a list in words of what it wears
    for every festival, which is the wreath for a screen reader and for a page
    with no scripts. yurt-wreath.js shows the dressing for the festival nearest
    today and says which, in words; it keeps and sends nothing and runs once.
  * cel-in-faery-yurt.js, between yurt-wreath markers: YURT_WREATH, the same
    festivals, which the room hangs on its door.

The eight festivals, their order and their words for when are her Myths &
Legends page's, and this tool checks every one against that page, so the
wreath can never name a festival the wheel there does not. Every ink is one
of her own, declared in love.css, by name; it refuses any other. Nothing on
it moves at any setting, and the tool refuses a §14 rule that animates it.
Never hand-edit between the markers.
"""
import html
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "yurt-wreath.json").read_text())
PAGE = ROOT / "faery-yurt.html"
ROOM = ROOT / "cel-in-faery-yurt.js"
MYTHS = ROOT / "faery-myths-room.html"
CSS = (ROOT / "love.css").read_text()
SCRIPT = ROOT / "yurt-wreath.js"
KINDS = {"leaf", "berry", "apple", "lantern", "drop", "egg", "flower", "ear", "acorn"}
TOPS = {"sun", "cross"}
fail = []


def refuse(msg):
    fail.append(msg)


def esc(s):
    return html.escape(s, quote=True)


declared = set(re.findall(r"(--[a-z0-9-]+)\s*:", CSS))
myths = MYTHS.read_text()
wheel = myths[myths.find('id="wheel"'):]
wheel = wheel[: wheel.find("yurt-myths:wheel:end")]
order = [re.sub(r"<[^>]+>", "", m) for m in re.findall(r"<li><b>(.*?)</b>", wheel)]

fests = DATA["festivals"]
if len(fests) != len(order):
    refuse(f"the wreath has {len(fests)} festivals and the Wheel of the Year on her Myths & Legends page has {len(order)}: they must be the same.")
for f, name in zip(fests, order):
    if not name.startswith(f["name"]):
        refuse(f"the wreath has {f['name']} where her Myths & Legends page's wheel has {name}, in the same place.")
    li = wheel[wheel.find(f"<b>{name}</b>"):]
    li = li[: li.find("</li>")]
    when = f["when"].split(", ")[-1] if f["when"].startswith("the ") else f["when"]
    if f["when"].startswith("the "):
        if f["when"].split(",")[0] not in li:
            refuse(f"{f['name']} is {f['when']!r} on the wreath and her Myths & Legends page does not say {f['when'].split(',')[0]!r} for it.")
    elif when not in li:
        refuse(f"{f['name']} is {when!r} on the wreath and her Myths & Legends page does not say so.")
    if not (1 <= f["month"] <= 12 and 1 <= f["day"] <= 31):
        refuse(f"{f['name']} has no real day.")
    inks = [i[1] for i in f["items"]] + ([f["top"][1]] if f.get("top") else []) + f.get("ribbons", [])
    for ink in inks:
        if ink not in declared:
            refuse(f"{f['name']}'s wreath wears {ink}, which love.css does not declare: it is drawn in her own inks or not at all.")
    for kind, _ in f["items"]:
        if kind not in KINDS:
            refuse(f"{f['name']}'s wreath has a {kind}, which this tool cannot draw.")
    if f.get("top") and f["top"][0] not in TOPS:
        refuse(f"{f['name']}'s wreath has a {f['top'][0]} at the top, which this tool cannot draw.")
ids = [f["id"] for f in fests]
if len(set(ids)) != len(ids):
    refuse("two festivals on the wreath share an id.")

# ── The drawing ──────────────────────────────────────────────────────────────
CX, CY, R = 80, 76, 44


def v(ink):
    return f"var({ink})"


def shape(kind, ink, x, y, a):
    t = f'transform="translate({x:.1f} {y:.1f}) rotate({a:.0f}) scale(1.3)"'
    if kind == "leaf":
        return f'<ellipse {t} rx="7" ry="3.2" fill="{v(ink)}"/>'
    if kind == "berry":
        return f'<g {t} fill="{v(ink)}"><circle cx="-2.6" cy="0" r="2.6"/><circle cx="2.6" cy="0.4" r="2.6"/><circle cx="0" cy="-3.6" r="2.6"/></g>'
    if kind == "apple":
        return f'<g {t}><circle r="6" fill="{v(ink)}"/><path d="M0 -6 L1 -9" stroke="{v("--timber")}" stroke-width="1.5"/><ellipse cx="3.5" cy="-8.5" rx="3" ry="1.4" fill="{v("--ivy")}"/></g>'
    if kind == "lantern":
        return (f'<g {t}><ellipse rx="7.5" ry="7" fill="{v(ink)}"/><path d="M-1 -7 C-2 -11 2 -12 1 -7" fill="{v("--ivy")}"/>'
                f'<path d="M-4 -2 l2 -2.5 l2 2.5 Z M1 -2 l2 -2.5 l2 2.5 Z M-4 2.5 Q0 5.5 4 2.5 Q0 3.6 -4 2.5 Z" fill="{v("--ember")}"/></g>')
    if kind == "drop":
        return (f'<g {t}><path d="M0 -9 L0 -3" stroke="{v("--ivy-2")}" stroke-width="1.4"/><circle cx="0" cy="-3" r="1.4" fill="{v("--ivy")}"/>'
                f'<path d="M0 -2 C-3.5 1 -3 6 0 7.5 C3 6 3.5 1 0 -2 Z" fill="{v(ink)}"/></g>')
    if kind == "egg":
        return f'<ellipse {t} rx="4.6" ry="6.2" fill="{v(ink)}"/>'
    if kind == "flower":
        middle = "--timber" if ink == "--toadstool" else "--candle"
        petals = "".join(f'<circle cx="{3.4 * math.sin(math.radians(k * 72)):.1f}" cy="{-3.4 * math.cos(math.radians(k * 72)):.1f}" r="2.7"/>' for k in range(5))
        return f'<g {t}><g fill="{v(ink)}">{petals}</g><circle r="1.8" fill="{v(middle)}"/></g>'
    if kind == "ear":
        grains = "".join(f'<ellipse cx="{(-1.8 if k % 2 else 1.8):.1f}" cy="{-2 - k * 2.6:.1f}" rx="1.6" ry="2.6" fill="{v(ink)}"/>' for k in range(5))
        return f'<g {t}><path d="M0 8 L0 -14" stroke="{v(ink)}" stroke-width="1.2"/>{grains}</g>'
    if kind == "acorn":
        return f'<g {t}><ellipse cx="0" cy="2" rx="3.6" ry="4.6" fill="{v("--tallow-3")}"/><path d="M-4.4 0 Q0 -5 4.4 0 Z" fill="{v(ink)}"/></g>'
    if kind == "sun":
        rays = "".join(f'<line x1="{11 * math.sin(math.radians(k * 45)):.1f}" y1="{-11 * math.cos(math.radians(k * 45)):.1f}" x2="{15 * math.sin(math.radians(k * 45)):.1f}" y2="{-15 * math.cos(math.radians(k * 45)):.1f}"/>' for k in range(8))
        return f'<g {t}><g stroke="{v(ink)}" stroke-width="2" stroke-linecap="round">{rays}</g><circle r="8.5" fill="{v(ink)}"/></g>'
    if kind == "cross":
        return (f'<g {t} fill="{v(ink)}"><rect x="-3" y="-3" width="6" height="6"/>'
                f'<rect x="-1.4" y="-14" width="2.8" height="11"/><rect x="3" y="-1.4" width="11" height="2.8"/>'
                f'<rect x="-1.4" y="3" width="2.8" height="11"/><rect x="-14" y="-1.4" width="11" height="2.8"/></g>')
    return ""


def at(angle, r=R):
    a = math.radians(angle)
    return CX + r * math.sin(a), CY - r * math.cos(a)


base = [f'<line x1="{CX}" y1="0" x2="{CX}" y2="{CY - R - 6}" stroke="{v("--tallow-3")}" stroke-width="2" stroke-dasharray="3 4"/>',
        f'<circle cx="{CX}" cy="{CY}" r="{R}" fill="none" stroke="{v("--timber")}" stroke-width="13"/>',
        f'<circle cx="{CX}" cy="{CY}" r="{R - 3}" fill="none" stroke="{v("--tallow-3")}" stroke-width="1.2" stroke-dasharray="7 5"/>',
        f'<circle cx="{CX}" cy="{CY}" r="{R + 3}" fill="none" stroke="{v("--tallow-3")}" stroke-width="1" stroke-dasharray="5 7" opacity=".7"/>']
for k in range(18):
    a = k * 20 + 10
    x, y = at(a, R + (3 if k % 2 else -3))
    base.append(f'<ellipse transform="translate({x:.1f} {y:.1f}) rotate({a + 45:.0f})" rx="5" ry="2.6" fill="{v("--ivy" if k % 3 else "--ivy-2")}"/>')

groups = []
for f in fests:
    parts = []
    spots = [22.5 + 45 * k for k in range(8)]
    for n, a in enumerate(spots):
        kind, ink = f["items"][n % len(f["items"])]
        x, y = at(a)
        parts.append(shape(kind, ink, x, y, a if kind in {"leaf", "ear", "drop"} else 0))
    if f.get("top"):
        x, y = at(0)
        parts.append(shape(f["top"][0], f["top"][1], x, y, 0))
    for n, ink in enumerate(f.get("ribbons", [])):
        dx = (n - 1) * 7
        parts.append(f'<path d="M{CX + dx / 3:.1f} {CY + R + 4} C{CX + dx - 6:.1f} {CY + R + 18} {CX + dx + 8:.1f} {CY + R + 24} {CX + dx:.1f} 148" fill="none" stroke="{v(ink)}" stroke-width="3" stroke-linecap="round"/>')
    groups.append(f'<g class="yurt-wreath__dress" data-sabbat="{f["id"]}" hidden>' + "".join(parts) + "</g>")

svg = (f'<svg class="yurt-wreath__art" viewBox="0 0 160 150" aria-hidden="true" focusable="false">\n          '
       + "\n          ".join(base + groups) + "\n        </svg>")

lis = "\n            ".join(
    f'<li data-sabbat="{f["id"]}" data-month="{f["month"]}" data-day="{f["day"]}"><b>{esc(f["name"])}</b>, {esc(f["when"])}: {esc(f["dress"])}.</li>'
    for f in fests)
block = f"""<div class="yurt-door__thing yurt-wreath" data-yurt-wreath>
        {svg}
        <h3 id="a-wreath-on-the-door">A wreath on the door</h3>
        <p>Willow and ivy, dressed for whichever festival of the <a href="faery-myths-room.html#wheel">Wheel of the Year</a> is nearest today, and changed as the year turns. The days are the northern hemisphere&rsquo;s. Nothing on it moves.</p>
        <p class="yurt-wreath__says" data-yurt-wreath-says>Today&rsquo;s dressing is chosen by the date on your own device.</p>
        <details class="yurt-wreath__all">
          <summary>What it wears for each festival</summary>
          <ul>
            {lis}
          </ul>
        </details>
      </div>"""

js_data = [{k: f[k] for k in ("id", "name", "month", "day", "when", "items") if k in f} | ({"top": f["top"]} if f.get("top") else {}) | ({"ribbons": f["ribbons"]} if f.get("ribbons") else {}) for f in fests]


def swap(src, begin, end, body, where):
    i, j = src.find(begin), src.find(end)
    if i < 0 or j < i:
        refuse(f"{where} has no {begin!r} … {end!r} markers for the wreath.")
        return src
    return src[: i + len(begin)] + "\n" + body + "\n" + src[j:]


page_src = PAGE.read_text()
room_src = ROOM.read_text()
new_page = swap(page_src, "<!-- yurt-wreath:begin -->", "<!-- yurt-wreath:end -->", "      " + block + "\n      ", "faery-yurt.html")
new_room = swap(room_src, "/* yurt-wreath:begin */", "/* yurt-wreath:end */",
                "      var YURT_WREATH = " + json.dumps(js_data, ensure_ascii=False) + ";\n      ", "cel-in-faery-yurt.js")
if '<script src="yurt-wreath.js" defer></script>' not in new_page:
    refuse("her yurt's page does not load yurt-wreath.js, so the wreath would stay undressed.")

js = SCRIPT.read_text() if SCRIPT.exists() else ""
for bad, why in ((r"localStorage|sessionStorage|indexedDB|document\.cookie", "keeps something"),
                 (r"\bfetch\(|XMLHttpRequest|sendBeacon|WebSocket", "sends something"),
                 (r"setTimeout|setInterval|requestAnimationFrame", "runs on a clock, so something would change by itself"),
                 (r"innerHTML|insertAdjacentHTML|outerHTML", "writes markup from a string")):
    if re.search(bad, js):
        refuse(f"yurt-wreath.js {why}; it reads the date once and shows one dressing.")
if "removeAttribute('hidden')" not in js:
    refuse("yurt-wreath.js must unhide a dressing with removeAttribute('hidden'): an SVG's hidden = false does nothing.")
sec = " ".join(r for r in CSS.split("}") if "yurt-wreath" in r.split("{")[0])
if re.search(r"animation|transition|transform", sec):
    refuse("§14's wreath rules animate it; nothing on the wreath moves at any setting.")

if fail:
    for f in fail:
        print("make-yurt-wreath: " + f, file=sys.stderr)
    sys.exit(1)
if new_page != page_src:
    PAGE.write_text(new_page)
if new_room != room_src:
    ROOM.write_text(new_room)
print("yurt wreath: the wreath dressed for every festival on her Myths & Legends page's wheel, on her door and on the yurt's door on Cel Street")
