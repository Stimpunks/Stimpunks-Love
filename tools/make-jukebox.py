#!/usr/bin/env python3
"""Rebuild the jukebox list in pink-pony-club.html from data/jukebox.json.

The tracks are between the two markers below and nothing else in the page is
touched. Every id in that file came out of our own published Double Rainbow page,
except where a video has since stopped playing and carries a 'replaced' note
saying where its id came from instead; the titles and channels were
resolved against YouTube's oEmbed endpoint rather than typed from memory. If you add a track, add it there and run this —
do not hand-edit the list, because a hand-edited entry has no provenance.
"""
import json, re, pathlib, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / "data/jukebox.json").read_text())

items = []
for t in data["tracks"]:
    label = f'{t["artist"]} — {t["title"]}'
    items.append(f'''    <li class="track">
      <h3>{html.escape(t["artist"])}</h3>
      <p>{html.escape(t["note"])}</p>
      <button type="button" class="facade" data-embed-id="{t["id"]}" data-embed-title="{html.escape(label, quote=True)}">
        {html.escape(t["title"])}
        <span class="facade__play">▶ PRESS PLAY</span>
      </button>
      <p style="margin:9px 0 0;font-size:12px;color:#6b3a55;">on YouTube, via {html.escape(t["channel"])}</p>
    </li>''')

block = "\n".join(items)
page = ROOT / "pink-pony-club.html"
src = page.read_text()
new = re.sub(
    r"(<!-- jukebox:begin -->).*?(<!-- jukebox:end -->)",
    lambda m: m.group(1) + "\n" + block + "\n    " + m.group(2),
    src, flags=re.S)
page.write_text(new)
print(f"jukebox: {len(data['tracks'])} tracks written to {page.name}")
