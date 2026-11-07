#!/usr/bin/env python3
"""Read Unicode's list of emoji and CLDR's English keywords for them, and write
cb-emoji.js, the list the CB's emoji picker shows.

Ryan's ask, 2026-11-06: pick emoji from the message box, after Stoat's and
Discord's pickers. The list is Unicode's own emoji-test.txt (Emoji 15.1, so
nearly every device of the last couple of years can draw every one) in its own
groups and order, every fully-qualified emoji but the skin-tone and hair
variants, which the picker leaves to the device's own keyboard; and each one's
search words are its Unicode name plus CLDR's English keywords (cldr-json
46.0.0). Both are Unicode's data, under the Unicode License, which the liner
notes credit. Nothing is drawn: every emoji is the device's own, in its own
font, so the picker fetches no picture from anywhere.

The file is served from our site and loaded only when somebody opens the
picker's Emoji tab, so a radio that never opens it never downloads it.

Kept out of tools/check-all.sh because it needs the network, as the other
pull- tools are. cb-emoji.js is committed. Run this only to move to a newer
Emoji version, and check that the devices our community uses draw it first.

Usage: python3 tools/pull-emoji.py
"""
import json
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
EMOJI = "15.1"
CLDR = "46.0.0"
TEST = f"https://unicode.org/Public/emoji/{EMOJI}/emoji-test.txt"
ANN = f"https://raw.githubusercontent.com/unicode-org/cldr-json/{CLDR}/cldr-json/cldr-annotations-full/annotations/en/annotations.json"
SKIN = {0x1F3FB, 0x1F3FC, 0x1F3FD, 0x1F3FE, 0x1F3FF}
HAIR = {0x1F9B0, 0x1F9B1, 0x1F9B2, 0x1F9B3}


def get(url):
    req = urllib.request.Request(url, headers={"user-agent": "stimpunks.world tools/pull-emoji.py"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


def main():
    test = get(TEST)
    ann = json.loads(get(ANN))["annotations"]["annotations"]
    groups, group = [], None
    for line in test.splitlines():
        if line.startswith("# group:"):
            name = line.split(":", 1)[1].strip()
            group = None if name == "Component" else [name, []]
            if group:
                groups.append(group)
            continue
        if not group or line.startswith("#") or "; fully-qualified" not in line:
            continue
        codes = [int(c, 16) for c in line.split(";")[0].split()]
        if any(c in SKIN for c in codes) or (len(codes) > 1 and any(c in HAIR for c in codes)):
            continue
        char = "".join(chr(c) for c in codes)
        # "# 😀 E1.0 grinning face"
        name = line.split("#", 1)[1].strip().split(" ", 2)[2]
        words = ann.get(char) or ann.get(char.replace("️", "")) or {}
        keys = [k for k in words.get("default", []) if k.lower() not in name.lower()]
        group[1].append([char, name, " ".join(keys)] if keys else [char, name])
    if sum(len(g[1]) for g in groups) < 1000:
        print("REFUSING: Unicode's list read as far fewer emoji than it holds.")
        sys.exit(2)
    body = json.dumps(groups, ensure_ascii=False, separators=(",", ":"))
    out = (
        "/* The CB's emoji picker's list, written by tools/pull-emoji.py from Unicode's\n"
        f"   emoji-test.txt (Emoji {EMOJI}) and CLDR's English keywords (cldr-json {CLDR}),\n"
        "   both under the Unicode License. Never hand-edit it: run the tool again.\n"
        "   Each group is [its name, [[emoji, name, keywords?], ...]], in Unicode's order.\n"
        "   Loaded by cb.js only when somebody opens the Emoji tab. */\n"
        f"window.loveEmoji = {body};\n"
    )
    (ROOT / "cb-emoji.js").write_text(out, encoding="utf-8")
    print(f"cb-emoji.js: Emoji {EMOJI}, {len(groups)} groups, {len(out) // 1024} KB")


if __name__ == "__main__":
    main()
