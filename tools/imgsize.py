"""The pixel size of a JPEG, PNG or WebP, read out of the file's own header.

WHY THE GENERATORS ASK THIS INSTEAD OF BEING TOLD. An <img> with no width and
height reserves no room until its bytes arrive, so everything under it jumps
when it does -- on the Pebble Board and in the Mopery that was dozens of
pictures shoving the text down a page somebody had started reading. The fix is
the two attributes, and the numbers belong to the file: typed into a data file
they are one re-export away from wrong, and a wrong ratio is a distorted
picture rather than a missing optimisation. So every generator that writes an
<img> reads them here, from the same bytes the browser will get.

No dependency on purpose. The tools here run with nothing installed, and a
header is a few bytes at a known offset.

IT REFUSES rather than guessing: a file it cannot read is an error, because a
missing size quietly reintroduces the jump and a made-up one distorts.
"""
import struct
from pathlib import Path


def size(path):
    """(width, height) in pixels, or SystemExit naming the file."""
    p = Path(path)
    data = p.read_bytes()[:65536]
    try:
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            return struct.unpack(">II", data[16:24])
        if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            kind = data[12:16]
            if kind == b"VP8 ":
                w, h = struct.unpack("<HH", data[26:30])
                return w & 0x3FFF, h & 0x3FFF
            if kind == b"VP8L":
                b = int.from_bytes(data[21:25], "little")
                return (b & 0x3FFF) + 1, ((b >> 14) & 0x3FFF) + 1
            if kind == b"VP8X":
                return (int.from_bytes(data[24:27], "little") + 1,
                        int.from_bytes(data[27:30], "little") + 1)
        if data[:2] == b"\xff\xd8":
            data = p.read_bytes()
            i = 2
            while i < len(data):
                if data[i] != 0xFF:
                    i += 1
                    continue
                marker = data[i + 1]
                if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                    i += 2
                    continue
                length = struct.unpack(">H", data[i + 2:i + 4])[0]
                # Start-of-frame markers carry the size; DHT, JPG and DAC do not.
                if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                    h, w = struct.unpack(">HH", data[i + 5:i + 9])
                    return w, h
                i += 2 + length
    except (struct.error, IndexError):
        pass
    raise SystemExit(f"REFUSING: cannot read the pixel size of {p}. A missing size brings "
                     "back the jump; a guessed one distorts the picture.")


def attrs(path):
    """The two attributes, ready to go into a tag."""
    w, h = size(path)
    return f'width="{w}" height="{h}"'
