#!/usr/bin/env python3
"""Cut the nails out of Em's product photographs and stand each set in a row.

Em makes hand-painted press-on nails and sells them as Ems Nails 4 You. She gave
Stimpunks permission to use her photographs on Stimpunks.World however we like,
and the rows this writes into nails/ are the dividers between the parts of the
front page. Where every nail is, and which way it points, is data/ems-nails.json.

KEPT OUT OF check-all.sh, LIKE pull-world-land.py. It fetches her photographs
from her own site and it needs a Mac: the cutting is Apple's subject lifting
(tools/lift-subject.swift, compiled here with swiftc), which runs on the machine
and sends nothing anywhere. Run it again only when a box in the data changes or
she sends new sets. The photographs themselves are never committed; only the
rows are, with no metadata in them.

HER WORK IS NOT RETOUCHED. A nail is lifted, turned upright and scaled, and its
edge is softened by a pixel so no white fur from the photograph rims it on the
street's dark ground. Nothing is recoloured, sharpened, filtered or redrawn: the
row is her nails as her camera saw them. A nail whose photograph cuts it off is
left out rather than finished by hand, and the data says so.

usage: python3 tools/cut-ems-nails.py [--keep DIR]
"""
import argparse
import json
import math
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "ems-nails.json"
OUT = ROOT / "nails"

HEIGHT = 240      # pixels tall: a row is drawn about 96px tall, so this covers 2.5x
GAP = 0.42        # the space between two nails, as a share of the median nail's width
SIDE = 0.25       # the space at each end of the row, the same way
QUALITY = 88


def fetch(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "stimpunks.world cut-ems-nails"})
    with urllib.request.urlopen(req, timeout=30) as r:
        dest.write_bytes(r.read())


def lifter(work):
    src = ROOT / "tools" / "lift-subject.swift"
    exe = work / "lift-subject"
    subprocess.run(["swiftc", "-O", str(src), "-o", str(exe)], check=True)
    return exe


def largest_part(alpha):
    """Keep the biggest connected piece of the mask: a lift that also caught a
    corner of a stand or a tuft of fur gives it up here."""
    w, h = alpha.size
    px = alpha.load()
    seen = bytearray(w * h)
    best = []
    for y in range(h):
        for x in range(w):
            if px[x, y] < 128 or seen[y * w + x]:
                continue
            part, stack = [], [(x, y)]
            seen[y * w + x] = 1
            while stack:
                cx, cy = stack.pop()
                part.append((cx, cy))
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and px[nx, ny] >= 128:
                        seen[ny * w + nx] = 1
                        stack.append((nx, ny))
            if len(part) > len(best):
                best = part
    keep = Image.new("L", (w, h), 0)
    kp = keep.load()
    for x, y in best:
        kp[x, y] = 255
    # Grow the kept piece back by its own soft edge, then take the lift's own
    # alpha inside it, so the edge stays the lift's and not a hard step.
    grown = keep.filter(ImageFilter.MaxFilter(5))
    out = Image.new("L", (w, h), 0)
    op, gp = out.load(), grown.load()
    for y in range(h):
        for x in range(w):
            if gp[x, y]:
                op[x, y] = px[x, y]
    return out


def drop_rack(crop, alpha):
    """Her racks are teal, and no nail here is: a lift that took a slab of rack
    along with its nail gives the slab up by its colour."""
    rgb = crop.convert("HSV").load()
    a = alpha.load()
    w, h = alpha.size
    for y in range(h):
        for x in range(w):
            hue, sat, val = rgb[x, y]
            if 112 <= hue <= 145 and sat > 60 and val > 90:      # 158-205 degrees
                a[x, y] = 0
    return alpha


def keep_to_body(nail):
    """A nail is no wider at its base than across its body. Whatever stands out
    past the body's widest row, beyond a pixel or two, is a stand or a shadow:
    the cup under a nail and the shadow beside it both bulge out at the foot."""
    a = nail.getchannel("A")
    w, h = a.size
    px = a.load()
    spans = {}
    for y in range(h):
        xs = [x for x in range(w) if px[x, y] > 128]
        if xs:
            spans[y] = (xs[0], xs[-1])
    ys = sorted(spans)
    top, bottom = ys[0], ys[-1]
    body = [spans[y] for y in ys if top + 0.05 * (bottom - top) <= y <= top + 0.78 * (bottom - top)]
    left = sorted(l for l, r in body)[len(body) // 10] - 2
    right = sorted((r for l, r in body), reverse=True)[len(body) // 10] + 2
    for y in range(h):
        for x in list(range(0, max(0, left))) + list(range(min(w, right + 1), w)):
            px[x, y] = 0
    nail.putalpha(a)
    return nail


def fill_holes(alpha):
    """Close any hole inside the nail: a white dot can read as background to the
    lift, and a nail with a hole in it is not the nail she painted."""
    from PIL import ImageDraw
    w, h = alpha.size
    solid = alpha.point(lambda v: 255 if v >= 128 else 0).convert("L")
    framed = Image.new("L", (w + 2, h + 2), 0)
    framed.paste(solid, (1, 1))
    ImageDraw.floodfill(framed, (0, 0), 128)
    inside = framed.crop((1, 1, w + 1, h + 1)).point(lambda v: 255 if v == 0 else 0)
    return Image.composite(Image.new("L", (w, h), 255), alpha, inside)


def axis_angle(alpha):
    """The angle of the nail's long axis from vertical, in degrees."""
    w, h = alpha.size
    px = alpha.load()
    pts = [(x, y) for y in range(0, h, 2) for x in range(0, w, 2) if px[x, y] > 128]
    n = len(pts)
    mx = sum(p[0] for p in pts) / n
    my = sum(p[1] for p in pts) / n
    sxx = sum((p[0] - mx) ** 2 for p in pts) / n
    syy = sum((p[1] - my) ** 2 for p in pts) / n
    sxy = sum((p[0] - mx) * (p[1] - my) for p in pts) / n
    theta = 0.5 * math.atan2(2 * sxy, sxx - syy)      # long axis from the x axis
    return math.degrees(theta) - 90


def width_near(alpha, top):
    """How wide the nail is a fifth of the way in from its top or bottom end."""
    w, h = alpha.size
    px = alpha.load()
    rows = [y for y in range(h) if any(px[x, y] > 128 for x in range(w))]
    y = rows[0] + (rows[-1] - rows[0]) // 5 if top else rows[-1] - (rows[-1] - rows[0]) // 5
    return sum(1 for x in range(w) if px[x, y] > 128)


def erase(alpha, off, origin):
    """Clear what a person marked as not the nail: each polygon is in the
    photograph's own pixels, drawn over a shadow or a stand by eye."""
    from PIL import ImageDraw
    d = ImageDraw.Draw(alpha)
    ox, oy = origin
    for poly in off:
        pts = [(poly[i] - ox, poly[i + 1] - oy) for i in range(0, len(poly), 2)]
        d.polygon(pts, fill=0)
    return alpha


def cut(photo, box, turn, exe, work, n, rack=False, off=()):
    pad = 3
    l, t, r, b = box
    crop = photo.crop((max(0, l - pad), max(0, t - pad), min(photo.width, r + pad), min(photo.height, b + pad)))
    src, dst = work / f"in-{n}.png", work / f"out-{n}.png"
    crop.save(src)
    subprocess.run([str(exe), str(src), str(dst)], check=True)
    lifted = Image.open(dst).convert("RGBA")
    alpha = erase(lifted.getchannel("A"), off, (max(0, l - pad), max(0, t - pad)))
    if rack:
        alpha = drop_rack(crop, alpha)
    alpha = fill_holes(largest_part(alpha))
    # Pull the edge in by a pixel and soften it, so no fur rims the nail.
    alpha = alpha.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    nail = crop.convert("RGBA")
    nail.putalpha(alpha)
    nail = nail.crop(alpha.getbbox())
    angle = axis_angle(nail.getchannel("A"))
    if angle < -90:
        angle += 180
    if angle > 90:
        angle -= 180
    nail = nail.rotate(angle, resample=Image.BICUBIC, expand=True)
    if turn == "down":
        nail = nail.rotate(180, expand=True)
    elif turn == "auto":
        a = nail.getchannel("A")
        if width_near(a, top=True) > width_near(a, top=False):
            nail = nail.rotate(180, expand=True)
    nail = keep_to_body(nail)
    nail.putalpha(largest_part(nail.getchannel("A")))
    nail = nail.crop(nail.getchannel("A").getbbox())
    return level_base(nail)


def level_base(nail):
    """Where a box cut a nail's base on a slant, take the foot up to the first
    row that is most of the nail's width, so it stands flat on the line."""
    a = nail.getchannel("A").load()
    w, h = nail.size
    widths = [sum(1 for x in range(w) if a[x, y] > 128) for y in range(h)]
    full = max(widths)
    y = h
    while y > h * 0.8 and widths[y - 1] < 0.6 * full:
        y -= 1
    return nail.crop((0, 0, w, y))


def row(nails):
    """Stand the nails on one baseline, each set at one scale, so a long nail is
    long and a short one short, as she made them."""
    scale = HEIGHT / max(n.height for n in nails)
    sized = [n.resize((max(1, round(n.width * scale)), max(1, round(n.height * scale))), Image.LANCZOS) for n in nails]
    widths = sorted(n.width for n in sized)
    mid = widths[len(widths) // 2]
    gap, side = round(mid * GAP), round(mid * SIDE)
    out = Image.new("RGBA", (sum(widths) + gap * (len(sized) - 1) + side * 2, HEIGHT), (0, 0, 0, 0))
    x = side
    for n in sized:
        out.alpha_composite(n, (x, HEIGHT - n.height))
        x += n.width + gap
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--keep", help="also write every lifted nail into this folder, to look at")
    args = ap.parse_args()
    data = json.loads(DATA.read_text())
    OUT.mkdir(exist_ok=True)
    keep = Path(args.keep) if args.keep else None
    if keep:
        keep.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        work = Path(tmp)
        exe = lifter(work)
        for s in data["sets"]:
            jpg = work / s["photo"]
            fetch(data["shop"] + s["photo"], jpg)
            photo = Image.open(jpg).convert("RGB")
            nails, closeups = [], []
            for i, spec in enumerate(s["nails"]):
                if isinstance(spec, list):
                    spec = {"box": spec}
                nail = cut(photo, spec["box"], spec.get("turn", s["turn"]), exe, work, f'{s["id"]}-{i}',
                           rack=s.get("rack") == "teal", off=spec.get("off", ()))
                (closeups if spec.get("closeup") else nails).append(nail)
                if keep:
                    nail.save(keep / f'{s["id"]}-{i}.png')
            if closeups:
                # A close-up is nearer the camera: bring its nails to the main
                # panel's size by their widths, which every nail shows whole.
                main_w = sorted(n.width for n in nails)[len(nails) // 2]
                close_w = sorted(n.width for n in closeups)[len(closeups) // 2]
                k = main_w / close_w
                nails += [n.resize((round(n.width * k), round(n.height * k)), Image.LANCZOS) for n in closeups]
            strip = row(nails)
            dest = OUT / f'{s["id"]}.webp'
            strip.save(dest, "WEBP", quality=QUALITY, method=6)
            print(f"{dest.relative_to(ROOT)}: {len(nails)} nails, {strip.width}x{strip.height}")


if __name__ == "__main__":
    sys.exit(main())
