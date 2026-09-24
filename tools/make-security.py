#!/usr/bin/env python3
"""Write /.well-known/security.txt, and refuse to let it lapse.

RFC 9116. A security.txt tells somebody who has found a hole how to tell us
about it, and it is cheap to publish. What is not cheap is the one field the
RFC makes mandatory: Expires. A file past its Expires is INVALID rather than
merely old, so a researcher's tooling discards it and we have published a
contact that says "do not use me". Star Stuff gates the same date on every
ship; this is that check, for this site.

THE CONTACT IS GITHUB'S PRIVATE VULNERABILITY REPORTING, not an inbox, and it
was switched on for this repository on 2026-09-23 so that it could be. The
source is public, so an issue would disclose a report the moment it was filed;
a draft advisory is private until we publish it. A general contact form was
the alternative and Star Stuff's own reasoning rejects it: the spec's warning
is that an UNMONITORED contact is worse than no file, and a busy nonprofit's
contact form is that for a security report. The contact page is still named in
SECURITY.md for anybody who will not use GitHub.

Fields are kept to the ones that are true. No Encryption, because there is no
PGP key; no Acknowledgments, because there is no hall of fame. An empty gesture
in a security file is a claim.

TO RENEW: bump EXPIRES about a year forward and run this again. It refuses from
RENEW_WITHIN_DAYS out, so the refusal arrives while there is still time.
"""
import datetime
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / ".well-known" / "security.txt"
SITE = "https://stimpunks.world"
REPO = "https://github.com/Stimpunks/Stimpunks-Love"

EXPIRES = datetime.datetime(2027, 9, 23, tzinfo=datetime.timezone.utc)
RENEW_WITHIN_DAYS = 30


def main():
    now = datetime.datetime.now(datetime.timezone.utc)
    left = (EXPIRES - now).days
    if left < RENEW_WITHIN_DAYS:
        print(f"REFUSING: security.txt {'expired' if left < 0 else 'expires'} "
              f"{EXPIRES:%Y-%m-%d} ({left} days). RFC 9116 treats a lapsed file as\n"
              "invalid, so it is a published contact that says do not use me. Move EXPIRES\n"
              "about a year forward in this file and run it again.")
        return 1

    text = "\n".join([
        "# stimpunks.world -- Stimpunks Foundation",
        "#",
        "# A static site: no server-side code, no accounts, no database, no cookies. The",
        "# full policy, including what is in scope and what is not, is at the Policy URL",
        "# below. Please use the private channel -- issues on the repository are public",
        "# the moment they are opened.",
        "",
        f"Contact: {REPO}/security/advisories/new",
        f"Policy: {REPO}/blob/main/SECURITY.md",
        f"Expires: {EXPIRES:%Y-%m-%dT%H:%M:%SZ}",
        "Preferred-Languages: en",
        f"Canonical: {SITE}/.well-known/security.txt",
        "",
    ])
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(text)
    print(f"security.txt: expires {EXPIRES:%Y-%m-%d}, {left} days left")
    return 0


if __name__ == "__main__":
    sys.exit(main())
