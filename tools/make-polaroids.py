#!/usr/bin/env python3
"""Rebuild the polaroid wall in enids-room.html from data/polaroids.json.

The wall is community photographs and it is empty on purpose. Stock images of
strangers standing in for us is the one thing this site cannot do, so the plates
stay grey until a real person sends a real photo. This tool builds whichever of
those two states is true, and refuses to build a third.

IT ENFORCES THE PROMISES IN polaroids.html RATHER THAN TRUSTING THEM:

  - No alt text, no photo. A picture nobody can hear is not on a Disabled
    people's site by accident; it is there by neglect. The description is the
    subject's own words, so a missing one is also a missing consent.
  - No named subject and no consent date, no photo. If we cannot say who agreed
    and when, we do not have their agreement, we have a file.
  - No EXIF, no exceptions. Photographs carry where you were, when, and on what
    device. This refuses to publish a file that still has any, because sending
    us a picture should not tell the internet where somebody lives. Strip it
    first; the refusal names the file.
  - A named photographer must also have given permission. Being in a picture is
    not the same as owning it.

WITHDRAWAL is deletion, not a flag. Remove the entry, remove the file, run this.
There is no 'hidden' state to forget to honour later, and nothing to un-hide by
accident. The wall goes back to grey by itself.

THE PHOTOS ARE NOT CC BY-SA. See LICENSE and the _licence note in the data file.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "enids-room.html"
PHOTOS = ROOT / "photos"
SUFFIXES = (".jpg", ".jpeg", ".png", ".webp")


def has_exif(raw: bytes) -> bool:
    """True if the file still carries EXIF. Deliberately blunt: any is too much."""
    if raw[:2] == b"\xff\xd8":                      # JPEG: an APP1 Exif segment
        i = 2
        while i + 4 < len(raw):
            if raw[i] != 0xFF:
                break
            marker, size = raw[i + 1], int.from_bytes(raw[i + 2:i + 4], "big")
            if marker == 0xE1 and raw[i + 4:i + 10].startswith(b"Exif"):
                return True
            if marker in (0xDA, 0xD9):              # image data begins; done looking
                break
            i += 2 + size
        return False
    if raw[:8] == b"\x89PNG\r\n\x1a\n":
        return b"eXIf" in raw[:200000]
    if raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        return b"EXIF" in raw[:200000]
    return False


def find_file(pid):
    for suf in SUFFIXES:
        p = PHOTOS / f"{pid}{suf}"
        if p.exists():
            return p
    return None


def main():
    data = json.loads((ROOT / "data/polaroids.json").read_text())
    photos = data.get("photos", [])

    blocks, seen = [], set()
    for ph in photos:
        pid = ph.get("id")
        if not pid:
            raise SystemExit("REFUSING: a photo entry has no id.")
        if pid in seen:
            raise SystemExit(f"REFUSING: two entries share the id {pid!r}.")
        seen.add(pid)

        for field, why in (("alt", "a description for anybody who cannot see it"),
                           ("subject", "who is in it, named the way they asked"),
                           ("consent_on", "the date they agreed")):
            if not str(ph.get(field, "")).strip():
                raise SystemExit(
                    f"REFUSING: {pid!r} has no {field!r} — {why}.\n"
                    "polaroids.html promises this and the promise is not optional."
                )
        if len(ph["alt"].split()) < 4:
            raise SystemExit(
                f"REFUSING: the alt text for {pid!r} is {ph['alt']!r}.\n"
                "That is not a description. Ask them what they want said about it."
            )
        if ph.get("photographer") and not ph.get("photographer_agreed"):
            raise SystemExit(
                f"REFUSING: {pid!r} credits a photographer and does not record their\n"
                "permission. Being in a picture is not the same as owning it."
            )

        f = find_file(pid)
        if not f:
            raise SystemExit(
                f"REFUSING: {pid!r} is in the data and there is no file for it in photos/.\n"
                "If the photo was withdrawn, delete the entry too — withdrawal is deletion."
            )
        if has_exif(f.read_bytes()):
            raise SystemExit(
                f"REFUSING: {f.name} still carries EXIF metadata, which can include where\n"
                "and when it was taken. Strip it before this goes anywhere public."
            )

        who = html.escape(ph["subject"])
        shot = ph.get("photographer")
        # Somebody who photographs themselves is still the photographer, and the
        # consent record keeps both facts -- but "Ryan Boren, photographed by
        # Ryan Boren" is noise on a polaroid.
        if shot and shot.strip() == ph["subject"].strip():
            credit = f"{who}, a self-portrait"
        elif shot:
            credit = f"{who}, photographed by {html.escape(shot)}"
        else:
            credit = who
        cap = html.escape(ph.get("caption") or "")
        blocks.append(
            f'          <figure class="polaroid" style="margin:0;">\n'
            f'            <img class="polaroid__plate" src="photos/{f.name}" '
            f'alt="{html.escape(ph["alt"], quote=True)}" loading="lazy">\n'
            f'            <figcaption>{cap}<span class="polaroid__credit">{credit}</span></figcaption>\n'
            f'          </figure>'
        )

    if not blocks:
        blocks.append(
            '          <figure class="polaroid" style="margin:0;">\n'
            '            <div class="polaroid__plate" aria-hidden="true"></div>\n'
            '            <figcaption>the one where nobody made us smile</figcaption>\n'
            '          </figure>'
        )

    note = ('          <p class="polaroid__note">Polaroids are community photographs, sent by the '
            'people in them, captioned and described in their own words. The wall is grey until '
            'somebody sends one &mdash; stock images of strangers standing in for us is the one '
            'thing this room will not do. <a href="polaroids.html">What we ask, and what we '
            'promise</a>.</p>')

    block = "\n".join(blocks) + "\n" + note
    src = PAGE.read_text()
    if "<!-- polaroids:begin -->" not in src:
        raise SystemExit(
            f"REFUSING: {PAGE.name} has no <!-- polaroids:begin --> / <!-- polaroids:end -->\n"
            "markers, so there is nowhere to build the wall."
        )
    out = re.sub(r"(<!-- polaroids:begin -->).*?(<!-- polaroids:end -->)",
                 lambda m: m.group(1) + "\n" + block + "\n          " + m.group(2),
                 src, flags=re.S)
    PAGE.write_text(out)
    n = len(photos)
    print(f"polaroids: {n} photo{'' if n == 1 else 's'} on the wall"
          + ("" if n else " — grey placeholder, as intended"))


if __name__ == "__main__":
    main()
