#!/usr/bin/env python3
"""Write each page's JSON-LD into its head. See tools/structured.py for what it
says and why it can only say what the page's own head already does.

Run it after anything that changes a page's <title>, description or canonical.
make-foundry.py builds its whole page from a template and applies the same
function itself, so a rebuild of the Foundry cannot drop it.
"""
import json
import re
import sys
from pathlib import Path

import structured

ROOT = Path(__file__).resolve().parent.parent


def main():
    written, skipped = 0, []
    for p in sorted(ROOT.glob("*.html")):
        src = p.read_text()
        new = structured.apply(src, p.name)
        if structured.BEGIN not in new:
            skipped.append(p.name)
        else:
            # Parse back what was written: a block that is not valid JSON is worse
            # than none, because a reader trusts it more than the page.
            m = re.search(r'<script type="application/ld\+json">(.*?)</script>', new, re.S)
            json.loads(m.group(1).replace("<\\/", "</"))
        if new != src:
            p.write_text(new)
            written += 1
    print(f"structured data: {written} pages rewritten; "
          f"none on {', '.join(skipped) or 'nothing'} (no canonical, so no address to describe)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
