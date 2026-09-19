#!/usr/bin/env python3
"""Compute the CSP hash for the one inline script on this site and write it into _headers.

Every page runs the same pre-paint snippet that applies the intensity dial's
default. It is byte-identical on all ten pages, so ONE hash covers the site —
this script checks that claim rather than assuming it, because a stale hash does
not warn: the browser silently refuses the snippet and everyone who asked for
Gentle gets flashed the loud version instead. That is the exact failure the dial
exists to prevent, arriving through the security header.
"""
import base64, hashlib, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
pages = sorted(ROOT.glob("*.html"))
snippets = set()
for p in pages:
    for m in re.finditer(r"<script>(.*?)</script>", p.read_text(), re.S):
        snippets.add(m.group(1))

if len(snippets) != 1:
    print(f"REFUSING: expected 1 distinct inline script, found {len(snippets)}.")
    print("Either the snippet drifted between pages or a new inline script appeared.")
    print("Fix the pages, or teach this tool to emit several hashes — do not add 'unsafe-inline'.")
    sys.exit(2)

snippet = snippets.pop()
digest = base64.b64encode(hashlib.sha256(snippet.encode()).digest()).decode()
csp = (
    "default-src 'self'; base-uri 'none'; object-src 'none'; form-action 'none'; "
    "frame-ancestors 'none'; img-src 'self'; font-src 'self'; connect-src 'none'; "
    "frame-src https://www.youtube-nocookie.com; style-src 'self' 'unsafe-inline'; "
    f"script-src 'self' 'sha256-{digest}'"
)
hdr = ROOT / "_headers"
src = hdr.read_text()
new = re.sub(r"(# >>> csp.*?\n)  Content-Security-Policy: [^\n]*",
             lambda m: m.group(1) + "  Content-Security-Policy: " + csp, src, flags=re.S)
hdr.write_text(new)
print(f"csp: sha256-{digest}  ({len(pages)} pages, 1 snippet)")
