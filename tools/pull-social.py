#!/usr/bin/env python3
"""Fold what the office posted to Stimpunks Social into data/social.json.

    python3 tools/pull-social.py

The office's Posts page puts each post to Stimpunks Social in a public store
on the server, which /social shows at once (netlify/functions/cb-social.mjs).
This reads that store from the live site, the same GET any visitor's page
makes, and adds every post data/social.json does not have yet, by its id, so
the page is built from the repository again (tools/make-social.py) and the
store only ever holds the last few days. It never changes or removes a post
already in the data. tools/daily-social.sh runs it each morning.

It refuses, and writes nothing, if the site does not answer or answers with
something it cannot read.
"""
import json
import re
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "social.json"
URL = "https://stimpunks.world/cb/social"


def main():
    try:
        req = urllib.request.Request(URL, headers={"accept": "application/json", "user-agent": "stimpunks.world morning fold"})
        got = json.loads(urllib.request.urlopen(req, timeout=20).read())
    except Exception as e:
        print(f"REFUSING: {URL} did not answer with what this reads ({e.__class__.__name__}). Nothing written.")
        return 2
    posts = got.get("posts") if isinstance(got, dict) else None
    if not isinstance(posts, list):
        print("REFUSING: the answer has no list of posts. Nothing written.")
        return 2
    data = json.loads(DATA.read_text())
    have = {p["id"] for p in data["posts"]}
    new = []
    for p in posts:
        if not (isinstance(p, dict) and isinstance(p.get("id"), str) and re.fullmatch(r"[a-z][A-Za-z0-9_-]{1,40}", p["id"])
                and isinstance(p.get("t"), str) and re.fullmatch(r"\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ", p["t"]) and isinstance(p.get("text"), str)):
            print("REFUSING: a post in the answer is not one this reads. Nothing written.")
            return 2
        if p["id"] not in have:
            new.append({"id": p["id"], "t": p["t"], "text": p["text"], "from": "office"})
    if not new:
        print("pull-social: nothing new to fold in.")
        return 0
    data["posts"] = sorted(data["posts"] + new, key=lambda p: p["t"], reverse=True)
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print(f"pull-social: folded in {len(new)} new.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
