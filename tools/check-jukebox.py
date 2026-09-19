#!/usr/bin/env python3
"""Check that every track on the dancefloor still plays.

Pink Pony Club is ten press-to-play facades. A facade whose video has died
looks exactly like one that works, right up until a reader presses it and gets
"Video unavailable" -- which is what happened to Bad Cop / Bad Cop's "Warriors"
some time between the room shipping and somebody pressing it. Nothing on this
site notices that kind of rot, because the id is still a well-formed id and the
page still renders. Only a reader finds it, and only by being disappointed.

HOW, because the two obvious tests are worthless here and cost an hour to rule out:

  - YouTube's oEmbed endpoint returns 200, with the correct title, for a video
    that will not play. It cannot see this at all.
  - Loading youtube.com/embed/<id> directly gives "Error 153" for EVERY video,
    working or not, because there is no proper origin on the request. A control
    on a known-good id is what showed that, and without the control it looks
    like a real finding.

  What does distinguish them is the watch page's own playabilityStatus, which
  reads UNPLAYABLE for a dead video and OK for a live one. That is what this
  checks.

NOT PART OF THE PRE-DEPLOY RUN. This is the only tool here that needs the
network, and a checker that fails on a train would either block a deploy or
teach everyone to skip it. Run it when you think of it, or when a track looks
wrong. The other tools stay offline and stay in the sequence.

CHANNEL DRIFT is reported but never fails the run, because a channel being
renamed is not a broken page.

  The name printed in the credits is 'channel' and is allowed to be a wording
  choice: "Merge Records", not YouTube's current "Merge Records on YouTube";
  "Bad Cop / Bad Cop", not the auto-generated "Bad Cop Bad Cop - Topic". Where
  the two differ the entry carries 'channel_verbatim', and THAT is what this
  compares against. Otherwise every deliberate wording choice would be reported
  as drift on every run, and a report that is always noisy is a report nobody
  reads -- which would cost us the one signal this part exists to give.

TITLES ARE NOT CHECKED. The stored titles are deliberately split from the
artist and trimmed -- "Live at Paste Studio NYC", not the full upload title --
so comparing them to oEmbed would fail on nine of ten and mean nothing.
"""
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
PAUSE = 1.5  # be a guest on somebody else's server


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def playability(video_id):
    """OK / UNPLAYABLE / LOGIN_REQUIRED / ... or None if we could not tell."""
    try:
        html = get(f"https://www.youtube.com/watch?v={video_id}")
    except (urllib.error.URLError, TimeoutError, OSError):
        return None
    m = re.search(r'"playabilityStatus":\{"status":"([A-Z_]+)"', html)
    return m.group(1) if m else None


def channel_now(video_id):
    q = urllib.parse.urlencode(
        {"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"})
    try:
        return json.loads(get("https://www.youtube.com/oembed?" + q))["author_name"]
    except Exception:
        return None


def main():
    data = json.loads((ROOT / "data/jukebox.json").read_text())
    tracks = data["tracks"]
    dead, unknown, drift = [], [], []

    for i, t in enumerate(tracks):
        status = playability(t["id"])
        time.sleep(PAUSE)
        chan = channel_now(t["id"])
        if i < len(tracks) - 1:
            time.sleep(PAUSE)

        if status is None:
            mark, unknown_it = "????", True
            unknown.append((t, "no playabilityStatus in the response"))
        elif status == "OK":
            mark, unknown_it = "ok  ", False
        else:
            mark, unknown_it = "DEAD", False
            dead.append((t, status))

        print(f"{mark} {status or 'no answer':<14} {t['artist']} — {t['title']}")
        expected = t.get("channel_verbatim", t["channel"])
        if chan and chan != expected:
            drift.append((t, expected, chan))

    if drift:
        print("\nchannel renamed since the id was extracted (not a failure):")
        for t, expected, now in drift:
            print(f"  {t['artist']}: recorded {expected!r} — now {now!r}")
        print("  If the new name is right, update 'channel_verbatim' (or 'channel' if there\n"
              "  is no verbatim field) so this stays quiet and the next rename is visible.")

    print(f"\n{len(tracks)} tracks checked, {len(dead)} not playable.")

    if unknown and len(unknown) == len(tracks):
        raise SystemExit(
            "\nREFUSING: not one track answered, so this says nothing about the jukebox.\n"
            "That is almost certainly no network rather than ten dead videos. Try again\n"
            "before believing anything here."
        )
    if unknown:
        print(f"{len(unknown)} track(s) gave no answer — inconclusive, not dead. Re-run those.")
    if dead:
        print(
            "\nA dead facade looks identical to a working one until somebody presses it.\n"
            "Find a replacement, put the new id in data/jukebox.json with a 'replaced'\n"
            "note saying where it came from, and re-run make-jukebox and make-liner-notes\n"
            "so both surfaces move together."
        )
    sys.exit(1 if (dead or unknown) else 0)


if __name__ == "__main__":
    main()
