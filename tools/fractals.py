"""The fractal window's switch, one per room, written into every page's sign-off.

WHAT IT IS. Ryan, 2026-09-27: a visualizer to turn on in rooms that play music,
and then in every room -- "follow the Arcade: it runs at every setting, starts
only when pressed, and has its own speed control." fractal.js is the window;
this file is the switch and the recipe it carries.

ONE ENGINE, A DIFFERENT PICTURE IN EVERY ROOM, AND A ROOM WITH NO RECIPE IS A
REFUSAL. The shared thing is the behaviour -- the window, the speed control, the
limit that stops it flashing -- the way the job marker's behaviour is shared in
§4. The picture is the room's: which fractal, and which of the room's own
custom properties it is drawn in. So data/fractals.json holds one recipe per
page, and this refuses a page it has no recipe for, because the failure mode of
guessing is one default fractal quietly turning up in every room, which is the
harmonising instinct arriving through plumbing (make-guild.py's reason).

IT REFUSES:
  · a page with no entry, and an entry for a page that does not exist;
  · an entry that is `off` without saying why -- make-jukebox.py's held rule;
  · a kind this does not know, a key a kind does not take (a typo is not an
    error anywhere else: the window would quietly draw the default), and a
    number outside the range the engine was written for;
  · a colour love.css does not declare in :root as a hex -- the canvas reads
    the custom property off the page, and a var() it cannot parse draws
    nothing, the Covenstead repaint's dead-var() lesson;
  · two rooms with the same fractal in the same colours, because no two rooms
    alike is the one rule on this street.

THE SWITCH SAYS WHAT IT IS BEFORE THE PRESS, like every press-to-play control
here says how long it runs: that the picture is not synced to any music (it
cannot be; see fractal.js), that it never flashes, and that it runs until it is
switched off or the room is left. It ships `hidden` and love.js unhides it, so
a page with no script shows no dead control.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "fractals.json"

ON = "Switch on the fractal window"
ABOUT = ("A slow fractal in this room’s own colours, drawn in your browser in a window of its own. "
         "It is not synced to any music, it never flashes at any speed, and it runs until you switch "
         "it off or leave the room.")

NUM = (int, float)
COLOURS = {"ground", "inks"}
COMMON = {"kind", "spin", "cycle", "bands", "fade", "span", "period", "iter"}
KINDS = {
    "julia":   {"power", "c", "orbit"},
    "mandel":  {"power", "center", "depth", "conj"},
    "newton":  {"degree", "relax", "twist"},
    "phoenix": {"c", "p", "orbit", "swing"},
    "ember":   {"c", "orbit"},
    "orbit":   {"power", "c", "orbit", "trap", "radius"},
    "ifs":     {"figure", "sway"},
}
REQUIRED = {"julia": {"c"}, "mandel": {"center"}, "phoenix": {"c", "p"}, "ember": {"c"},
            "orbit": {"c"}, "ifs": {"figure"}}
FIGURES = {"fern", "triangle", "dragon", "spiral", "tree", "crystal"}
TRAPS = {"ring", "cross", "point"}
RANGES = {
    "power": (2, 6), "degree": (3, 6), "depth": (1, 400), "iter": (16, 160),
    "orbit": (0, 0.1), "spin": (0, 1), "cycle": (0, 0.1), "bands": (0.005, 2),
    "fade": (1, 12), "span": (0.5, 6), "period": (30, 300), "relax": (0, 0.6),
    "twist": (0, 0.5), "swing": (0, 0.2), "sway": (0, 0.3), "radius": (0, 3), "p": (-1, 1),
}
INTS = {"power", "degree", "iter"}


def declared():
    """Every custom property on love.css's :root that holds a plain hex."""
    css = (ROOT / "love.css").read_text()
    out = {}
    for m in re.finditer(r"(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?)\b", css):
        out.setdefault(m.group(1), m.group(2))
    return out


def pages():
    return sorted(p.name for p in ROOT.glob("*.html"))


def load():
    """The recipes, checked. Returns {page: recipe or None when off}."""
    data = json.loads(DATA.read_text())
    rooms = data.get("rooms")
    if not isinstance(rooms, dict):
        raise SystemExit(f"REFUSING: {DATA.name} has no rooms object.")
    have, colours = set(pages()), declared()
    missing = sorted(have - set(rooms))
    if missing:
        raise SystemExit("REFUSING: no fractal recipe for " + ", ".join(missing) + ". Every room gets "
                         f"its own picture in {DATA.name}, or an `off` saying why it has none.")
    stale = sorted(set(rooms) - have)
    if stale:
        raise SystemExit("REFUSING: a fractal recipe for a page that does not exist: " + ", ".join(stale))
    out, seen = {}, {}
    for page, r in rooms.items():
        where = f"{DATA.name}, {page}"
        if "off" in r:
            if set(r) != {"off"} or not isinstance(r["off"], str) or len(r["off"].strip()) < 20:
                raise SystemExit(f"REFUSING: {where} is off without a sentence saying why, or carries "
                                 "a recipe as well. A room without the window says why.")
            out[page] = None
            continue
        kind = r.get("kind")
        if kind not in KINDS:
            raise SystemExit(f"REFUSING: {where} asks for a kind of fractal fractal.js does not draw: {kind!r}.")
        allowed = COMMON | COLOURS | KINDS[kind]
        extra = sorted(set(r) - allowed)
        if extra:
            raise SystemExit(f"REFUSING: {where} carries {', '.join(extra)}, which a {kind} does not take. "
                             "A key the engine does not read is a setting that silently does nothing.")
        need = sorted(REQUIRED.get(kind, set()) - set(r))
        if need:
            raise SystemExit(f"REFUSING: {where} is a {kind} with no {', '.join(need)}.")
        for k, v in r.items():
            if k in RANGES:
                lo, hi = RANGES[k]
                if isinstance(v, bool) or not isinstance(v, NUM) or not lo <= v <= hi or (k in INTS and v != int(v)):
                    raise SystemExit(f"REFUSING: {where}: {k} is {v!r}; the engine was written for "
                                     f"{'whole numbers ' if k in INTS else ''}{lo} to {hi}.")
            elif k in ("c", "center"):
                if not (isinstance(v, list) and len(v) == 2 and all(isinstance(x, NUM) and abs(x) <= 2.5 for x in v)):
                    raise SystemExit(f"REFUSING: {where}: {k} must be a point, two numbers within 2.5 of zero.")
        if kind == "ifs" and r["figure"] not in FIGURES:
            raise SystemExit(f"REFUSING: {where}: no figure called {r['figure']!r}.")
        if "trap" in r and r["trap"] not in TRAPS:
            raise SystemExit(f"REFUSING: {where}: no trap called {r['trap']!r}.")
        if "conj" in r and not isinstance(r["conj"], bool):
            raise SystemExit(f"REFUSING: {where}: conj is true or false.")
        inks = r.get("inks")
        if r.get("ground") not in colours:
            raise SystemExit(f"REFUSING: {where}: ground {r.get('ground')!r} is not declared in love.css's "
                             ":root as a hex, so the window would have nothing to read.")
        if not (isinstance(inks, list) and 2 <= len(inks) <= 6):
            raise SystemExit(f"REFUSING: {where}: inks must be two to six of the room's own colours.")
        bad = [v for v in inks if v not in colours]
        if bad:
            raise SystemExit(f"REFUSING: {where}: {', '.join(map(str, bad))} not declared in love.css's :root "
                             "as a hex. A var() the canvas cannot read draws nothing, and nothing warns.")
        key = (kind, r.get("figure"), r.get("ground"), tuple(inks))
        if key in seen:
            raise SystemExit(f"REFUSING: {page} and {seen[key]} would draw the same {kind} in the same colours. "
                             "No two rooms alike.")
        seen[key] = page
        out[page] = r
    return out


def switch(page, recipes=None):
    """The switch for one page, or '' for a room the window is off in."""
    recipes = recipes if recipes is not None else load()
    r = recipes.get(page)
    if r is None:
        return ""
    blob = html.escape(json.dumps(r, separators=(",", ":")), quote=True)
    return (f'<p class="signoff__fx" hidden><button type="button" class="signoff__fx-btn" '
            f'data-fx="{blob}" aria-describedby="signoff-fx-about">{ON}</button> '
            f'<span id="signoff-fx-about">{html.escape(ABOUT, quote=False)}</span></p>')
