#!/usr/bin/env python3
"""Read Natural Earth's land, lakes and borders and write the member map's
world into data/world-land.json and data/world-detail.json.

Ryan's brief, 2026-10-22: move the member map off Google My Maps and onto the
street, with no map tiles, so a visitor's browser asks nobody else for
anything. The world is Natural Earth's 1:50m land (public domain,
naturalearthdata.com, version 5.1.2), simplified to what a map the width of a
page can show, with Antarctica left off because nobody's pin will be there
and it would take a quarter of the height. Every ring is kept as longitude
and latitude, rounded to two places (about a kilometre), so the projection
lives in one place, tools/make-member-map.py, which draws it.

WHAT YOU SEE ZOOMED IN is data/world-detail.json (Ryan's question, 2026-10-23:
"Can I zoom in on this map?"): the same land kept finer, with its holes, and
Natural Earth's 1:50m lakes, borders between countries, and the lines between
states and provinces in the countries it draws them for, so a place zoomed in
on has something round it to say where it is. The wall asks for it only when
somebody zooms, so the map everybody sees first stays as light as it was.

Kept out of tools/check-all.sh because it needs the network, as the other
pull- tools are. Run it only to change the world's detail; the data files it
writes are committed, and the map is drawn from them.

Usage: python3 tools/pull-world-land.py [directory]
       (a directory holding ne_50m_land, ne_50m_lakes,
       ne_50m_admin_0_boundary_lines_land and
       ne_50m_admin_1_states_provinces_lines, each .geojson; without one it
       fetches them from Natural Earth's repository)
"""
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "world-land.json"
DETAIL = ROOT / "data" / "world-detail.json"
BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/"
SOURCE = BASE + "ne_50m_land.geojson"

TOLERANCE = 0.25      # degrees, under a pixel at the width the map is drawn: what Douglas-Peucker may leave out
SMALLEST = 0.02       # square degrees: a ring smaller than this is left off
SOUTHMOST = -60.0     # a ring wholly south of this (Antarctica) is left off
FINE = 0.02           # degrees: what the zoomed-in detail may leave out, under a pixel and a half at its closest
FINEST = 0.004        # square degrees: a ring smaller than this is left out of the detail


def simplify(points, tol):
    """Douglas-Peucker, iteratively, keeping the first and last points."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = points[a]
        bx, by = points[b]
        dx, dy = bx - ax, by - ay
        far, at = -1.0, None
        for i in range(a + 1, b):
            px, py = points[i]
            if dx == 0 and dy == 0:
                d = ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
            else:
                d = abs(dy * px - dx * py + bx * ay - by * ax) / (dx * dx + dy * dy) ** 0.5
            if d > far:
                far, at = d, i
        if at is not None and far > tol:
            keep[at] = True
            stack.append((a, at))
            stack.append((at, b))
    return [p for p, k in zip(points, keep) if k]


def area(ring):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(ring, ring[1:] + ring[:1]))) / 2


def read(name, where):
    if where:
        return json.loads((Path(where) / f"ne_50m_{name}.geojson").read_text())
    with urllib.request.urlopen(BASE + f"ne_50m_{name}.geojson", timeout=60) as r:
        return json.loads(r.read())


def polygons(data):
    """Every polygon as its rings, outer first, each without its closing point."""
    for feat in data["features"]:
        geom = feat["geometry"]
        for poly in (geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]):
            yield [[tuple(p[:2]) for p in ring[:-1]] for ring in poly]


def lines(data):
    for feat in data["features"]:
        geom = feat["geometry"]
        for line in (geom["coordinates"] if geom["type"] == "MultiLineString" else [geom["coordinates"]]):
            yield [tuple(p[:2]) for p in line]


def kept(pts):
    return [[round(x, 2), round(y, 2)] for x, y in pts]


def fine_ring(raw):
    """A ring for the detail, or None if it is too small to keep."""
    if len(raw) < 3 or area(raw) < FINEST:
        return None
    extent = max(max(x for x, _ in raw) - min(x for x, _ in raw), max(y for _, y in raw) - min(y for _, y in raw))
    pts = simplify(raw, min(FINE, extent / 8))
    return kept(pts) if len(pts) >= 4 else None


def detail(where):
    """The land again, finer and with its holes, and the lakes, borders and state lines."""
    land = []
    for poly in polygons(read("land", where)):
        if max(lat for _, lat in poly[0]) < SOUTHMOST:
            continue
        outer = fine_ring(poly[0])
        if outer:
            land.append([outer] + [h for h in (fine_ring(r) for r in poly[1:]) if h])
    lakes = [r for poly in polygons(read("lakes", where)) for r in [fine_ring(poly[0])] if r]
    borders = [kept(simplify(l, FINE)) for l in lines(read("admin_0_boundary_lines_land", where)) if len(l) > 1]
    states = [kept(simplify(l, FINE)) for l in lines(read("admin_1_states_provinces_lines", where)) if len(l) > 1]
    return {
        "_what": "The member map's world zoomed in: Natural Earth's 1:50m land with its holes, lakes, borders between countries and lines between states and provinces, version 5.1.2, public domain (naturalearthdata.com), simplified by tools/pull-world-land.py, every point longitude and latitude to two places. tools/make-member-map.py projects it into member-map-detail.json, which the Community Center's wall asks for only when somebody zooms. Do not hand-edit; run the pull tool again to change the detail.",
        "sources": [BASE + f"ne_50m_{n}.geojson" for n in ("land", "lakes", "admin_0_boundary_lines_land", "admin_1_states_provinces_lines")],
        "land": land, "lakes": lakes, "borders": borders, "states": states,
    }


def main():
    where = sys.argv[1] if len(sys.argv) > 1 else None
    data = read("land", where)
    rings = []
    for feat in data["features"]:
        geom = feat["geometry"]
        polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
        for poly in polys:
            outer = poly[0]   # holes (lakes inside land) are left off: a map this size cannot show them
            if max(lat for _, lat in outer) < SOUTHMOST:
                continue
            if area([tuple(p[:2]) for p in outer]) < SMALLEST:
                continue
            raw = [tuple(p[:2]) for p in outer[:-1]]
            # A small island keeps its shape: the tolerance shrinks with it, so Malta is not simplified away.
            extent = max(max(x for x, _ in raw) - min(x for x, _ in raw), max(y for _, y in raw) - min(y for _, y in raw))
            pts = simplify(raw, min(TOLERANCE, extent / 8))
            if len(pts) < 4:
                continue
            rings.append([[round(x, 2), round(y, 2)] for x, y in pts])
    out = {
        "_what": "The member map's world: Natural Earth's 1:50m land, version 5.1.2, public domain (naturalearthdata.com), simplified by tools/pull-world-land.py, Antarctica and the smallest islands left off, every ring longitude and latitude to two places. tools/make-member-map.py projects and draws it. Do not hand-edit; run the pull tool again to change the detail.",
        "source": SOURCE,
        "rings": rings,
    }
    OUT.write_text(json.dumps(out, separators=(",", ":")) + "\n")
    print(f"world-land: {len(rings)} rings, {sum(len(r) for r in rings)} points, {OUT.stat().st_size // 1024} KB")
    d = detail(where)
    DETAIL.write_text(json.dumps(d, separators=(",", ":")) + "\n")
    print(f"world-detail: {len(d['land'])} pieces of land, {len(d['lakes'])} lakes, {len(d['borders'])} borders, "
          f"{len(d['states'])} state lines, {DETAIL.stat().st_size // 1024} KB")
    return 0


if __name__ == "__main__":
    sys.exit(main())
