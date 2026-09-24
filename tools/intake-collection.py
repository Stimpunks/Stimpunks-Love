#!/usr/bin/env python3
"""Take photographs of somebody's collection in, and make them safe to publish.

    python3 tools/intake-collection.py ryan-pens              # everything in collection/inbox/
    python3 tools/intake-collection.py ryan-pens a.heic b.jpg # or name the files

WHY THIS EXISTS. Ryan's brief for The Collection Collection, 2026-09-23: "I can
provide some pen photos to get started, but I need help processing them and
adding alt text. I can't title and describe and caption every picture myself.
That'll prevent me from ever submitting a photo." So the two jobs that stop
people sending a picture are both done here and not by them: this tool does the
processing, and the describing is done by whoever runs it next (in practice
Claude, looking at each file) and recorded as such. Nobody has to fill in a form
to put a pen in a cabinet.

WHAT IT DOES TO EACH FILE, in this order, and why the order matters:

  1. HEIC becomes JPEG, with the macOS `sips` that is already on the machine.
  2. THE ORIENTATION IS BAKED IN BEFORE THE METADATA GOES. A phone stores most
     pictures sideways and writes a tag saying which way up they are. Strip the
     tag without turning the pixels and every pen on the shelf lies on its side,
     which is the shape of mistake that looks like a style.
  3. EVERY BYTE OF METADATA GOES: EXIF, GPS, XMP, IPTC, the maker's notes, the
     camera serial. A phone photograph of a pen on a desk says, in its header,
     the latitude and longitude of the desk. Sending us a picture of your things
     must not tell the internet where your things are. The colour profile is the
     one thing kept, because dropping it shifts every ink on the page and it
     identifies nobody -- make-webp.py's rule.
  4. The long edge comes down to LONG_EDGE. It is never CROPPED -- the polaroid
     wall's promise, kept for things as well as for people.
  5. The file is written to collection/<cabinet>-NNN.jpg and a STUB is appended
     to that cabinet in data/collection.json with every descriptive field null.

THE STUB IS A REFUSAL WAITING TO HAPPEN, on purpose. make-collection.py will not
build while any item has no title, no alt or no caption, or has not had someone
look at the whole frame for a person or an address. So a photograph that has
been taken in but not yet described cannot slip onto the page undescribed; the
build stops and names it.

THE ORIGINALS ARE MOVED, NOT DELETED, into collection/inbox/taken/, which like
the rest of collection/inbox/ is in .gitignore. They still carry their GPS, so
they must never be committed; they are also somebody's own files, which is why
this tool does not throw them away. Empty that folder by hand once you are done.

Then run make-webp.py, which decides per file whether WebP earns its place, and
make-collection.py.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import date
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    raise SystemExit("REFUSING: this needs Pillow (python3 -m pip install Pillow). The site's\n"
                     "build tools need nothing installed; this one reads phone photographs.")

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "collection.json"
OUT = ROOT / "collection"
INBOX = OUT / "inbox"
TAKEN = INBOX / "taken"
LONG_EDGE = 1600      # drawn at well under half that; enough for a phone at 3x
QUALITY = 88          # make-webp.py measures from here, so start generous
TAKES = {".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp", ".tif", ".tiff"}

# The only keys a stub is born with. make-collection.py knows the rest.
STUB = ["id", "file", "title", "alt", "caption", "words", "described_on",
        "reads", "named", "named_by", "nobody_in_it", "nothing_says_where", "received_on"]


def to_jpeg_source(src, tmp):
    """HEIC through sips; anything Pillow reads, as it is."""
    if src.suffix.lower() in (".heic", ".heif"):
        dst = Path(tmp) / (src.stem + ".jpg")
        p = subprocess.run(["sips", "-s", "format", "jpeg", str(src), "--out", str(dst)],
                           capture_output=True, text=True)
        if p.returncode or not dst.exists():
            raise SystemExit(f"REFUSING: sips could not read {src.name}:\n{p.stderr[-400:]}")
        return dst
    return src


def main(argv):
    if not argv:
        raise SystemExit(__doc__.split("\n\n")[0] + "\n\nName the cabinet first.")
    cabinet, files = argv[0], [Path(a) for a in argv[1:]]
    data = json.loads(DATA.read_text())
    cab = next((c for c in data["cabinets"] if c["id"] == cabinet), None)
    if not cab:
        raise SystemExit(f"REFUSING: there is no cabinet {cabinet!r} in data/collection.json.\n"
                         "Cabinets are: " + ", ".join(c["id"] for c in data["cabinets"]) + "\n"
                         "A new collection is a new cabinet, added by hand with its owner's name "
                         "and how it reached us.")
    if not files:
        files = sorted(p for p in INBOX.glob("*") if p.is_file() and p.suffix.lower() in TAKES)
    if not files:
        raise SystemExit(f"Nothing to take in: collection/inbox/ is empty. Drop the photographs "
                         f"there, or name them.")

    OUT.mkdir(exist_ok=True)
    TAKEN.mkdir(parents=True, exist_ok=True)
    used = {int(m.group(1)) for it in cab["items"]
            if (m := re.search(r"-(\d+)$", it["id"]))}
    used |= {int(m.group(1)) for p in OUT.glob(f"{cabinet}-*")
             if (m := re.search(r"-(\d+)\.\w+$", p.name))}
    n = max(used, default=0)
    today = date.today().isoformat()

    with tempfile.TemporaryDirectory() as tmp:
        for src in files:
            if not src.exists():
                raise SystemExit(f"REFUSING: {src} does not exist.")
            n += 1
            pid = f"{cabinet}-{n:03d}"
            dst = OUT / f"{pid}.jpg"
            with Image.open(to_jpeg_source(src, tmp)) as im:
                icc = im.info.get("icc_profile")
                im = ImageOps.exif_transpose(im)          # turn the pixels, THEN drop the tag
                if im.mode not in ("RGB", "L"):
                    im = im.convert("RGB")
                im.thumbnail((LONG_EDGE, LONG_EDGE), Image.LANCZOS)   # never upsizes, never crops
                im.info = {}                              # nothing rides along by default
                kw = {"quality": QUALITY, "optimize": True, "progressive": True, "exif": b""}
                if icc:
                    kw["icc_profile"] = icc
                im.save(dst, "JPEG", **kw)                # no EXIF, GPS or XMP; make-collection.py checks
                w, h = im.size
            cab["items"].append({k: None for k in STUB} | {
                "id": pid, "file": f"collection/{pid}.jpg", "reads": [],
                "received_on": today})
            # Written after EVERY file, so a run that stops half way leaves no
            # photograph in collection/ without the stub that stops it publishing.
            DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
            if src.resolve().parent == INBOX.resolve():   # never move a file named elsewhere
                shutil.move(str(src), TAKEN / src.name)
            print(f"  {src.name} -> {dst.relative_to(ROOT)}  {w}x{h}, metadata gone")

    print(f"\n{cabinet}: stubs written to data/collection.json. Each one now needs a title, an\n"
          "alt and a caption written from the photograph, and somebody to look at the whole\n"
          "frame for a person or an address. make-collection.py will refuse until then.")


if __name__ == "__main__":
    main(sys.argv[1:])
