#!/usr/bin/env python3
"""Write the sign-off line into every page, and the same links into the pavement.

See tools/signoff.py for what the line is and why it borrows each room's voice
instead of bringing the street's. This file only puts it where it goes:

  · every page gets it straight after </main>, and <body> gets id="top" so
    that "Back to top" has somewhere to land;
  · the front page does NOT get the line -- it ends on its own pavement -- but
    the links inside the pavement come from the same list, between markers, so
    the street's footer and every room's sign-off cannot disagree about where
    the privacy page is;
  · 404.html gets root-absolute paths, because it answers at any depth.

IT REFUSES a page with no </main>, or more than one, rather than guessing where a
room ends; and a page whose sign-off markers have been deleted by hand is put
back, because a page without the line is the thing this exists to prevent.
Run it after anything that rewrites a whole page; make-foundry.py already calls
the same function itself.
"""
import re
import sys
from pathlib import Path

import signoff

ROOT = Path(__file__).resolve().parent.parent
FRONT = "index.html"
PAVEMENT_BEGIN, PAVEMENT_END = "<!-- signoff-links:begin -->", "<!-- signoff-links:end -->"


def with_top(src, name):
    m = re.search(r"<body\b[^>]*>", src)
    if not m:
        raise SystemExit(f"REFUSING: {name} has no <body> tag.")
    tag = m.group(0)
    if re.search(r'\bid="top"', tag):
        return src
    if re.search(r"\bid=", tag):
        raise SystemExit(f"REFUSING: {name}'s <body> already has an id, and Back to top needs "
                         "it to be \"top\". Decide which, by hand.")
    return src.replace(tag, tag[:-1] + ' id="top">', 1)


def main():
    changed = 0
    pages = sorted(ROOT.glob("*.html"))
    for p in pages:
        src = p.read_text()
        before = src
        src = with_top(src, p.name)
        if p.name == FRONT:
            if PAVEMENT_BEGIN not in src or PAVEMENT_END not in src:
                raise SystemExit(f"REFUSING: {FRONT}'s pavement has no signoff-links markers. "
                                 "The street's footer takes its links from the same list.")
            src = re.sub(
                re.escape(PAVEMENT_BEGIN) + r".*?" + re.escape(PAVEMENT_END),
                lambda _: f'{PAVEMENT_BEGIN}<a href="#top">Back to top<span aria-hidden="true"> &uarr;</span></a> '
                          f'&middot; {signoff.links()} &middot;{PAVEMENT_END}',
                src, count=1, flags=re.S)
        else:
            block = signoff.block(absolute=(p.name == "404.html"))
            if signoff.BEGIN in src:
                src = re.sub(re.escape(signoff.BEGIN) + r".*?" + re.escape(signoff.END),
                             lambda _: block, src, count=1, flags=re.S)
            else:
                n = src.count("</main>")
                if n != 1:
                    raise SystemExit(f"REFUSING: {p.name} has {n} </main> tags. The sign-off goes "
                                     "straight after the one main, and this will not guess.")
                src = src.replace("</main>", "</main>\n\n" + block, 1)
        if src != before:
            p.write_text(src)
            changed += 1
    print(f"signoff: {len(pages)} pages carry it (the front page in its pavement), "
          f"{changed} rewritten")
    return 0


if __name__ == "__main__":
    sys.exit(main())
