#!/usr/bin/env python3
"""Read Natural Earth's land and write the member map's world into data/world-land.json.

Ryan's brief, 2026-10-22: move the member map off Google My Maps and onto the
street, with no map tiles, so a visitor's browser asks nobody else for
anything. The world is Natural Earth's 1:50m land (public domain,
naturalearthdata.com, version 5.1.2), simplified to what a map the width of a
page can show, with Antarctica left off because nobody's pin will be there
and it would take a quarter of the height. Every ring is kept as longitude
and latitude, rounded to two places (about a kilometre), so the projection
lives in one place, tools/make-member-map.py, which draws it.

Kept out of tools/check-all.sh because it needs the network, as the other
pull- tools are. Run it only to change the world's detail; the data file it
writes is committed, and the map is drawn from that.

Usage: python3 tools/pull-world-land.py [path-to-ne_50m_land.geojson]
       (without a path it fetches the file from Natural Earth's repository)
"""
import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "world-land.json"
SOURCE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_50m_land.geojson"

TOLERANCE = 0.25      # degrees, under a pixel at the width the map is drawn: what Douglas-Peucker may leave out
SMALLEST = 0.02       # square degrees: a ring smaller than this is left off
SOUTHMOST = -60.0     # a ring wholly south of this (Antarctica) is left off


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


def main():
    if len(sys.argv) > 1:
        data = json.loads(Path(sys.argv[1]).read_text())
    else:
        with urllib.request.urlopen(SOURCE, timeout=60) as r:
            data = json.loads(r.read())
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
    return 0


if __name__ == "__main__":
    sys.exit(main())
