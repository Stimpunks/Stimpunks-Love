#!/usr/bin/env python3
"""
make-css-versions.py -- every stylesheet a script of ours puts into a page asks
for the version of that stylesheet it was written with.

Why (2026-11-08): an iPhone showed the chat with today's cb.js and a cb.css from
before the start of November. The radio had the parts cb.js makes (the Search
side beside a call, the call's button beside the channel's name) and none of
the rules that place them, so a switch meant only for a wide window with a call
stood on a phone, the + and the GIF, sticker and emoji icons stood outside the
message box as Safari's own grey buttons, and the camera on Join the call was as
wide as the screen. cb.css is served to be checked again every time, and the
browser kept its copy anyway. A stylesheet a script puts into a shadow root
(cb.css, forum.css, tasks.css and the rest) is not in the page's markup, so
nothing on the page tells the browser it changed.

So every string in a top-level script that names one of our stylesheets,
'/cb.css' or '/cb.css?v=…', is written as '/<name>.css?v=<the first ten hex
of its sha256>', and a stylesheet that changes is a new address the moment the
script that asks for it is. Netlify serves the file the same with any query.

Never hand-edit the ?v= part: this rewrites it on every run of check-all.sh,
after the generators that write stylesheets. It refuses a script naming a
stylesheet that is not there.
"""
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
NAMED = re.compile(r"""(['"])/([a-z0-9][a-z0-9-]*\.css)(?:\?v=[0-9a-f]+)?\1""")


def main():
    versions = {}
    problems = []
    changed = []
    for js in sorted(ROOT.glob("*.js")):
        text = js.read_text()

        def put(m):
            name = m.group(2)
            css = ROOT / name
            if not css.exists():
                problems.append(f"{js.name} asks for /{name}, which is not there.")
                return m.group(0)
            if name not in versions:
                versions[name] = hashlib.sha256(css.read_bytes()).hexdigest()[:10]
            q = m.group(1)
            return f"{q}/{name}?v={versions[name]}{q}"

        out = NAMED.sub(put, text)
        if out != text:
            js.write_text(out)
            changed.append(js.name)
    if problems:
        print("make-css-versions refused:")
        for p in problems:
            print("  " + p)
        sys.exit(1)
    if changed:
        print("make-css-versions: wrote the stylesheets' versions into " + ", ".join(changed) + ".")
    else:
        print("make-css-versions: every script already asks for its stylesheets' current versions.")


if __name__ == "__main__":
    main()
