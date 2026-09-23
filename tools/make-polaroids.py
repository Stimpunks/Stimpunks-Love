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
  - No filter, ever. polaroids.html promises in these words that we will not
    "Crop you. Filter you." The Faery Yurt's mockup arrived with a sepia wash
    over its portrait -- from the person in the photograph, which is the one
    version of this that sounds harmless and is not, because the next photo
    would arrive under a rule already bent once. A border, a shadow or a mat is
    a thing around a picture; a filter is a thing done to it. This checks the
    CSS as well as the markup rather than leaving it to somebody's memory.

WITHDRAWAL is deletion, not a flag. Remove the entry, remove the file, run this.
There is no 'hidden' state to forget to honour later, and nothing to un-hide by
accident. The wall goes back to grey by itself.

AND IT GUARDS EVERY OTHER PAGE, not just the wall. The Faery Yurt hangs one of
these photographs in Helen's own room, which put the consent record and the
publication in two different places for the first time -- exactly the gap where
a withdrawal gets half-honoured. So this walks all the HTML: every photos/ file
referenced anywhere has to be in the data, every reference outside the wall has
to be listed in that entry's "elsewhere", and every file in photos/ has to have
an entry. Delete a withdrawn entry and this REFUSES until the yurt lets go of it
too -- a refusal, rather than a broken image on a page nobody thought to check.

AND THE RECORD IS NOT THE VENUE. Every photograph here used to hang on Enid's
wall, so "has an entry" and "is on the wall" were one fact. The Pebble Board's
photographs are the first that belong to another room only: "on_wall": false
keeps the whole contract -- alt text, named subject, consent date, EXIF, the
site-wide walk, withdrawal-is-deletion -- and only declines to build a polaroid,
because hanging a photo on Enid's wall to satisfy a bookkeeping rule would be
this tool curating a room it is not about. Off the wall AND with no 'elsewhere'
is refused: that is a photograph of a real person published nowhere and sitting
in a public repository.

THE PHOTOS ARE NOT CC BY-SA. See LICENSE and the _licence note in the data file.
"""
import html
import json
import re
import sys
from pathlib import Path

import imgsize           # tools/imgsize.py: width and height read off the file

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


IMG = re.compile(r'<img\b[^>]*\bsrc="photos/([^"]+)"[^>]*>')
ALT = re.compile(r'\balt="([^"]*)"')
CLASSES = re.compile(r'\bclass="([^"]*)"')
RULE = re.compile(r'([^{}]+)\{([^{}]*)\}')


def check_nobody_is_filtered(photo_classes):
    """A photograph is published as it arrived. No crop, no filter, no exceptions.

    EVERY PHOTOGRAPH CARRIES class="photo" so that this check has something exact
    to look for; the first version of it scanned only the classes on the <img>
    itself, and sailed straight past `.portrait-frame img { filter: sepia(...) }`
    because the filter was written on a DESCENDANT selector rather than on the
    picture's own class. That is the shape this arrives in, so that is the shape
    it has to catch: any rule carrying a filter whose selector reaches .photo, or
    reaches images generically, or names a class one of them wears.

    Still deliberately crude, and it says so when it refuses -- a filter four
    ancestors up would get past it. What it catches is a filter written onto the
    picture's own rule because it looked like part of the design.
    """
    # Comments first: the selector pattern below is "everything up to a brace",
    # which otherwise drags the whole explanatory comment above a rule into the
    # refusal message and buries the selector it is naming.
    css = re.sub(r"/\*.*?\*/", "", (ROOT / "love.css").read_text(), flags=re.S)
    bad = []
    for sel, body in RULE.findall(css):
        if not re.search(r"(?<!-)\bfilter\s*:", body):
            continue
        for part in sel.split(","):
            reaches = (
                re.search(r"\bimg\b", part) or
                re.search(r"\.photo\b", part) or
                any(re.search(r"\." + re.escape(c) + r"\b", part) for c in photo_classes)
            )
            if reaches:
                bad.append(f"love.css  {part.strip()} {{{body.strip()[:60]}...}}")
                break
    if bad:
        raise SystemExit(
            "REFUSING: a CSS filter reaches a photograph:\n  " + "\n  ".join(bad) + "\n\n"
            "polaroids.html promises we will not filter anybody, and that promise is not\n"
            "waived by the person in the picture asking for it -- the next photograph would\n"
            "arrive under a rule already bent once. A frame, a shadow or a mat goes AROUND\n"
            "the picture and is fine; a filter is done TO it. Move the effect onto the\n"
            "wrapper, or take it off."
        )


def check_the_rest_of_the_site(photos):
    """Every photograph published anywhere is a photograph with a consent record.

    The wall is built above; this is about the pages that are not the wall. A
    photo in somebody's own room is still theirs, and 'it comes down when you
    say so' has to mean it comes down everywhere or it means nothing.
    """
    by_file, listed = {}, set()
    for ph in photos:
        f = find_file(ph["id"])
        if f:
            by_file[f.name] = ph
        for page in ph.get("elsewhere", []):
            listed.add((page, f.name if f else ph["id"]))

    found, photo_classes = set(), set()
    for page in sorted(ROOT.glob("*.html")):
        for tag in IMG.finditer(page.read_text()):
            name = tag.group(1)
            found.add((page.name, name))
            cls = CLASSES.search(tag.group(0))
            names = cls.group(1).split() if cls else []
            photo_classes.update(names)
            if "photo" not in names:
                raise SystemExit(
                    f'REFUSING: the <img> for photos/{name} on {page.name} has no "photo"\n'
                    "class. Every photograph on this site carries it, because that is what\n"
                    "the no-filter check looks for \u2014 an image without it is an image\n"
                    "nothing is watching."
                )
            if "filter" in tag.group(0).lower():
                raise SystemExit(
                    f"REFUSING: the <img> for photos/{name} on {page.name} carries a filter\n"
                    "in its own style attribute. polaroids.html promises we will not filter\n"
                    "anybody, and the person in the picture asking for it does not waive that."
                )
            if name not in by_file:
                raise SystemExit(
                    f"REFUSING: {page.name} publishes photos/{name} and there is no entry\n"
                    "for it in data/polaroids.json. A photograph with no consent record is\n"
                    "not published on this site, on any page, for any reason.\n"
                    "If it was withdrawn, take it off this page too \u2014 withdrawal is deletion."
                )
            alt = ALT.search(tag.group(0))
            if not (alt and alt.group(1).strip()):
                raise SystemExit(
                    f"REFUSING: {page.name} publishes photos/{name} with no alt text.\n"
                    "The wall cannot; neither can anywhere else."
                )
            if page.name != PAGE.name and (page.name, name) not in listed:
                raise SystemExit(
                    f"REFUSING: {page.name} publishes photos/{name} and the entry for it in\n"
                    "data/polaroids.json does not say so. Add it to that entry's "
                    '"elsewhere" list,\nso that deleting the entry catches this page too.'
                )

    for page, name in sorted(listed - found):
        raise SystemExit(
            f"REFUSING: data/polaroids.json says photos/{name} is published on {page},\n"
            "and it is not there. Either the page dropped it or the record is stale;\n"
            "either way the consent record has stopped describing the site."
        )

    check_nobody_is_filtered(photo_classes)

    orphans = sorted(f.name for f in PHOTOS.glob("*") if f.suffix.lower() in SUFFIXES
                     and f.name not in by_file)
    if orphans:
        raise SystemExit(
            f"REFUSING: photos/ holds {', '.join(orphans)} with no entry in\n"
            "data/polaroids.json. Unrecorded photographs of real people do not sit in\n"
            "a public repository waiting for somebody to use them."
        )
    return len(found)


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
        # A CONSENT RECORD IS NOT A BOOKING FOR ENID'S WALL. Until the Pebble
        # Board every photograph here hung on the wall and possibly somewhere
        # else too, so "in the data" and "on the wall" were the same fact. The
        # board's photographs are the first that belong to another room only,
        # and hanging them on Enid's wall because that is where the records live
        # would be this tool making a curation decision for a room it is not
        # about. "on_wall": false keeps every rule above and every check below --
        # the alt text, the named subject, the consent date, the EXIF sweep, the
        # site-wide walk, and withdrawal-is-deletion -- and only declines to
        # build a polaroid. A photo with no venue at all still refuses, because
        # that is an unpublished picture of a real person sitting in a public
        # repository, which is exactly what the orphan check is for.
        if ph.get("on_wall") is False:
            if not ph.get("elsewhere"):
                raise SystemExit(
                    f"REFUSING: {pid!r} is marked off the wall and lists no 'elsewhere',\n"
                    "so it is published nowhere and is just a photograph of somebody in a\n"
                    "public repository. Give it a page or delete the entry and the file."
                )
            continue
        blocks.append(
            f'        <figure class="polaroid" style="margin:0;">\n'
            f'          <img class="photo polaroid__plate" src="photos/{f.name}" {imgsize.attrs(ROOT / "photos" / f.name)} '
            f'alt="{html.escape(ph["alt"], quote=True)}" loading="lazy">\n'
            f'          <figcaption>{cap}<span class="polaroid__credit">{credit}</span></figcaption>\n'
            f'        </figure>'
        )

    if not blocks:
        blocks.append(
            '        <figure class="polaroid" style="margin:0;">\n'
            '          <div class="polaroid__plate" aria-hidden="true"></div>\n'
            '          <figcaption>the one where nobody made us smile</figcaption>\n'
            '        </figure>'
        )

    note = ('        <p class="polaroid__note">Polaroids are community photographs, sent by the '
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
                 lambda m: m.group(1) + "\n" + block + "\n        " + m.group(2),
                 src, flags=re.S)
    PAGE.write_text(out)
    elsewhere = check_the_rest_of_the_site(photos) - len(photos)
    n = len(photos)
    print(f"polaroids: {n} photo{'' if n == 1 else 's'} on the wall"
          + ("" if n else " — grey placeholder, as intended")
          + (f", {elsewhere} hung elsewhere and recorded" if elsewhere else ""))


if __name__ == "__main__":
    main()
