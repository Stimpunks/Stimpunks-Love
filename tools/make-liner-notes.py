#!/usr/bin/env python3
"""Rebuild the track credits in liner-notes.html from data/jukebox.json.

Same contract as make-jukebox.py: one source of truth for the ten tracks, so
the dancefloor and the credits page can never disagree about who made what.
"""
import json, re, pathlib, html
ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "data/jukebox.json").read_text())
rows = []
for t in data["tracks"]:
    rows.append(
        f'      <tr><td><strong>{html.escape(t["artist"])}</strong></td>'
        f'<td>{html.escape(t["title"])}</td>'
        f'<td>{html.escape(t["channel"])}</td>'
        f'<td><a href="https://www.youtube.com/watch?v={t["id"]}">watch</a></td></tr>')
page = ROOT / "liner-notes.html"
src = page.read_text()
page.write_text(re.sub(r"(<!-- credits:begin -->).*?(<!-- credits:end -->)",
    lambda m: m.group(1) + "\n" + "\n".join(rows) + "\n      " + m.group(2), src, flags=re.S))
print(f"liner notes: {len(data['tracks'])} track credits written")
