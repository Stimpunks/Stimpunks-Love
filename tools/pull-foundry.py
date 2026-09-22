#!/usr/bin/env python3
"""Read every typeface in fonts/ back to its own record, and write data/foundry-faces.json.

WHAT THIS IS FOR. The Foundry sets other people's letters at size, on purpose,
as the whole content of a room -- which is the one place on this street where a
missing designer credit would be least visible and most wrong. Nothing else here
shows you a typeface as the subject; every other room just uses one. So the name
of the person who drew each face, and the licence it travels under, are pulled
from the family's own record in the google/fonts repository rather than typed
from memory. THAT IS THE WHOLE POINT: the jukebox's ten tracks taught this repo
that a mapping written from memory is the exact fabrication this site spends a
page arguing against, and forty faces is forty chances to do it again.

WHY IT IS A SEPARATE TOOL FROM make-foundry.py. pull-arrivals.py and
make-arrivals.py, for pull-arrivals.py's reason: a build that cannot run on a
train is a build that stops being run. This one needs the network; the room's
generator needs nothing but the file this writes. DO NOT MERGE THEM. It is kept
out of the pre-deploy sequence with check-jukebox.py for the same reason.

WHERE THE RECORD COMES FROM. github.com/google/fonts holds one directory per
family, and the licence is WHICH DIRECTORY IT IS IN -- ofl/, apache/ or ufl/ --
with METADATA.pb inside naming the family, the designer and the licence again.
Both are read and they have to agree, because a directory this tool guessed
wrong would otherwise publish a confident licence for the wrong family.

IT REFUSES RATHER THAN GUESSES. A family in fonts/_sources.json that answers
from none of the three directories stops the run and is named, because the
alternatives are publishing a face with no designer on it or inventing one.
"""
import hashlib
import json
import re
import subprocess
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = ROOT / "fonts/_sources.json"
OUT = ROOT / "data/foundry-faces.json"

# The three licence directories, and what each one is called in the sentence the
# room prints. A family lives in exactly one of them.
DIRS = {
    "ofl": "SIL Open Font License 1.1",
    "apache": "Apache License 2.0",
    "ufl": "Ubuntu Font Licence 1.0",
}
RAW = "https://raw.githubusercontent.com/google/fonts/main/{d}/{slug}/METADATA.pb"


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16]


def fetch(url):
    """One request. curl rather than urllib so a proxy the shell already knows
    about is the one that gets used."""
    p = subprocess.run(["curl", "-sS", "-m", "30", "-w", "\n%{http_code}", url],
                       capture_output=True, text=True)
    if p.returncode != 0:
        return None, 0
    body, _, code = p.stdout.rpartition("\n")
    return body, int(code or 0)


def unquote(s):
    r"""METADATA.pb is a text protobuf, so a quote inside a value arrives
    backslash-escaped. UnifrakturMaguntia is credited to j. 'mach' wust and is
    the reason this exists: printed raw, that designer's name comes out of the
    room wearing two backslashes. It is the HTML-entity-in-a-payload bug in
    data/toys.json arriving through a different encoding."""
    return re.sub(r"\\(.)", r"\1", s)


def nested(pb, name):
    m = re.search(rf'^\s*{name}:\s*"(.*)"\s*$', pb, re.M)
    return unquote(m.group(1)) if m else ""


def field(pb, name):
    m = re.search(rf'^{name}:\s*"(.*)"\s*$', pb, re.M)
    return unquote(m.group(1)) if m else ""


def main():
    sources = json.loads(SOURCES.read_text())
    faces, missing = {}, []

    for slug in sorted(sources):
        # google/fonts names its directories with the family lowercased and
        # everything that is not a letter or a digit removed: im-fell-english
        # becomes imfellenglish, press-start-2p becomes pressstart2p.
        gslug = re.sub(r"[^a-z0-9]", "", slug.lower())
        found = None
        for d in DIRS:
            pb, code = fetch(RAW.format(d=d, slug=gslug))
            if code == 200 and pb:
                found = (d, pb)
                break
        if not found:
            missing.append(slug)
            continue
        d, pb = found

        stated = field(pb, "license").upper()
        expect = {"ofl": "OFL", "apache": "APACHE2", "ufl": "UFL"}[d]
        if stated and stated != expect:
            missing.append(f"{slug} (in {d}/ but its record says {stated})")
            continue

        # The copyright line lives on the first font block rather than at the
        # top of the record, so it is read out of the whole file.
        m = re.search(r'^\s*copyright:\s*"(.*)"\s*$', pb, re.M)
        faces[slug] = {
            "family": field(pb, "name"),
            # The record's own classification, used to group the specimen list.
            # Ours would be an opinion about somebody else's typeface; theirs is
            # a fact about the record.
            "category": field(pb, "category").replace("_", " ").title(),
            "designer": field(pb, "designer"),
            "licence": DIRS[d],
            "licence_url": f"https://github.com/google/fonts/tree/main/{d}/{gslug}",
            "copyright": unquote(m.group(1)) if m else "",
            # repository_url is nested inside the record's source block rather
            # than sitting at the top, so it is read wherever it turns up. The
            # first draft asked for it as a top-level field and got an empty
            # string for every family on the street without complaining once.
            "repository": nested(pb, "repository_url"),
            # Every variant the repository holds, with the sha256 of the file
            # each one actually points at. THE HASH IS A FACT ABOUT THE FILE AND
            # NEVER WAS ONE ABOUT THE LETTERS. This comment used to say the hash
            # was what made the room honest, and the bench grouped by it: several
            # families here are variable fonts, so one file is declared against
            # two or three weights -- and the browser instances that file's own
            # axis at each declaration, so the bytes are identical and the
            # outlines are not. Grouping by this threw away bolds that work.
            # The hash still earns its place, because it is what found Space
            # Grotesk stored three times over; what decides an offered weight is
            # tools/check-weights.py, which renders them and measures.
            "variants": [{"weight": f["weight"], "style": f["style"],
                          "file": f["file"],
                          "sha": sha(ROOT / "fonts" / f["file"])}
                         for f in sources[slug]],
        }
        print(f"  {faces[slug]['family']:<26} {faces[slug]['designer'][:44]:<46} {DIRS[d]}")

    if missing:
        print("\nREFUSING: no record could be read for:\n  " + "\n  ".join(missing) +
              "\n\nEvery face in this room is set at size with somebody's name under it.\n"
              "A family whose record cannot be read is a face this site would be\n"
              "publishing uncredited, so the run stops rather than guessing at one.",
              file=sys.stderr)
        return 1

    OUT.write_text(json.dumps({
        "_what": ("One record per typeface in fonts/, read off that family's own "
                  "METADATA.pb in github.com/google/fonts by tools/pull-foundry.py. "
                  "Nothing in this file was typed. The designer line is verbatim "
                  "from the record, including where a record credits a studio "
                  "rather than a person."),
        "_licence": ("The licence is which directory of that repository the family "
                     "lives in, cross-checked against the licence field inside its "
                     "own record. Both have to agree or the pull refuses."),
        "_checked": date.today().isoformat(),
        "faces": faces,
    }, indent=1, ensure_ascii=False) + "\n")
    print(f"\nwrote {OUT.relative_to(ROOT)}, checked {date.today().isoformat()}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
