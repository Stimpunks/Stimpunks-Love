#!/usr/bin/env python3
"""Re-encode the street's JPEGs as WebP, where that is measurably worth it.

EACH IMAGE IS DECIDED BY MEASUREMENT, NOT BY A QUALITY NUMBER TYPED ONCE. The
first test put one setting across the whole street and it was wrong both ways:
at quality 80 a photograph of a person dropped to an SSIM of 0.954 against its
source, visibly softer, while Doré's and Tenniel's engravings barely shrank at
all -- fine hatching is the thing lossy formats are worst at, and at quality 88
the WebP of one plate was LARGER than its JPEG. So for every file this finds
the lowest quality whose SSIM against the source reaches FIDELITY, and swaps
the file only if that WebP is at least MIN_SAVING smaller. Otherwise the JPEG
stays, and the reason is written down in data/webp.json beside the numbers, so
a later run does not re-litigate it and a reader can see it was looked at.

WEBP AND NOT AVIF, deliberately, although avifenc is installed and AVIF was
often smaller in the same test. Serving AVIF safely means a <picture> element
round every image, which changes the markup the rooms' CSS is written against:
the Pebble Board's play button is a flex container whose image must be its
direct child, and a wrapper would quietly undo the fix that stopped its 4:3
videos being squashed. WebP swaps into the same <img> with nothing else moving,
and every browser has read it since 2020.

SSIM IS MEASURED ON LUMINANCE, AND THE FIRST RUN IS WHY. It measured in RGB,
and lossy WebP always stores colour at half resolution -- as nearly every JPEG
here already does. On a small saturated thumbnail that alone holds RGB SSIM
under 0.98 even at quality 100 (0.975, measured), so the run concluded that
seven thumbnails could not be converted at all and left them at 1280px, which
was the one real waste on the street. It was measuring chroma subsampling, not
lost detail. Luminance is where the detail is and where the eye looks for it,
and it is what SSIM is conventionally computed on. That run deleted JPEGs
under the wrong rule and was reverted to the last commit before this one ran.

ONE RESIZE, AND ONLY WHERE THE FILE IS FAR LARGER THAN THE PAGE. The Pebble
Board's video thumbnails were stored at 1280px and are never drawn wider than
170: they go to THUMB_WIDTH, which covers a phone at 3x. Everything else keeps
its pixels -- a scan, a print or a photograph opened in a lightbox is the thing
itself, not a thumbnail of it.

METADATA: the colour profile is kept, so nothing shifts colour; EXIF is not,
and make-polaroids.py still refuses a photograph carrying any.

References are rewritten only where they are exact local paths -- a quoted
"raven/dore-001.jpg", or a bare quoted filename for the Pebble Board's thumbs
-- so a source URL that happens to end in .jpg in a provenance note is never
touched. Run the generators afterwards; this prints which.
"""
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LOG = ROOT / "data" / "webp.json"
DIRS = ["raven", "oracle", "alice", "pebbles", "photos"]
FIDELITY = 0.98        # SSIM against the source, on luminance
MIN_SAVING = 0.10      # a swap has to earn its place
QUALITIES = [75, 80, 85, 90, 94]
THUMB_WIDTH = 512
REFERENCES = [*sorted((ROOT / "data").glob("*.json")), ROOT / "tools" / "make-og.py"]


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True)


def ssim(ref, test):
    out = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(ref), "-i", str(test), "-lavfi",
         "[0:v]format=gray[a];[1:v]format=gray[b];[a][b]ssim", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    m = re.search(r"All:([0-9.]+)", out)
    if not m:
        raise SystemExit(f"REFUSING: could not measure SSIM for {ref.name}; ffmpeg said:\n{out[-400:]}")
    return float(m.group(1))


def decide(src, tmp):
    """(quality, ssim, bytes, webp_path) for the smallest WebP that reaches FIDELITY,
    or None if none does. Thumbnails are resized first and measured against the
    resized reference, because the resize is the intended change, not a loss."""
    ref = src
    if src.name.startswith("thumb-"):
        w = int(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                     "stream=width", "-of", "csv=p=0", str(src)]).stdout.strip())
        if w > THUMB_WIDTH:
            ref = tmp / (src.stem + "-ref.png")
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-vf",
                 f"scale={THUMB_WIDTH}:-2:flags=lanczos", str(ref)])
    for q in QUALITIES:
        out = tmp / f"{src.stem}-q{q}.webp"
        run(["cwebp", "-quiet", "-q", str(q), "-m", "6", "-metadata", "icc", str(ref), "-o", str(out)])
        s = ssim(ref, out)
        if s >= FIDELITY:
            return q, s, out.stat().st_size, out, ref != src
    return None


def main():
    log = json.loads(LOG.read_text()) if LOG.exists() else {"_what": "", "files": {}}
    log["_what"] = ("Every JPEG make-webp.py has looked at: the quality chosen and the SSIM it "
                    "reached, or why the JPEG was kept. Decided by measurement; see the tool.")
    files = log.setdefault("files", {})
    todo = [p for d in DIRS for p in sorted((ROOT / d).rglob("*.jpg"))]
    swapped = {}
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        for src in todo:
            rel = str(src.relative_to(ROOT))
            digest = hashlib.sha256(src.read_bytes()).hexdigest()
            prior = files.get(rel)
            if prior and prior.get("kept") and prior.get("sha256") == digest:
                continue                      # already looked at, and kept for a reason
            before = src.stat().st_size
            got = decide(src, tmp)
            if not got:
                files[rel] = {"kept": f"no WebP reached SSIM {FIDELITY} at quality {QUALITIES[-1]}",
                              "sha256": digest, "bytes": before}
                continue
            q, s, after, out, resized = got
            if after > before * (1 - MIN_SAVING):
                files[rel] = {"kept": f"the WebP that reached SSIM {FIDELITY} was {after} bytes "
                                      f"against {before}, under the {int(MIN_SAVING*100)}% a swap "
                                      "has to save", "quality": q, "ssim": round(s, 4),
                              "sha256": digest, "bytes": before}
                continue
            dest = src.with_suffix(".webp")
            dest.write_bytes(out.read_bytes())
            src.unlink()
            new = str(dest.relative_to(ROOT))
            files.pop(rel, None)
            files[new] = {"from": rel, "quality": q, "ssim": round(s, 4), "bytes_before": before,
                          "bytes_after": after, **({"resized_to": THUMB_WIDTH} if resized else {})}
            swapped[rel] = new

    for f in REFERENCES:
        text = f.read_text()
        orig = text
        for old, new in swapped.items():
            text = text.replace(f'"{old}"', f'"{new}"').replace(f"../{old}", f"../{new}")
            if old.startswith("pebbles/"):
                text = text.replace(f'"{Path(old).name}"', f'"{Path(new).name}"')
        if text != orig:
            f.write_text(text)
    LOG.write_text(json.dumps(log, indent=2, ensure_ascii=False) + "\n")

    kept = [k for k, v in files.items() if v.get("kept")]
    saved = sum(v["bytes_before"] - v["bytes_after"] for v in files.values() if "bytes_after" in v)
    print(f"webp: {len(swapped)} swapped this run, {len(kept)} kept as JPEG with a reason, "
          f"{saved // 1024} KB saved across every swap on record")
    if swapped:
        print("  now run: make-mopery.py make-oracle.py make-rabbit-hole.py make-pebble-board.py "
              "make-polaroids.py make-og.py")
    return 0


if __name__ == "__main__":
    sys.exit(main())
