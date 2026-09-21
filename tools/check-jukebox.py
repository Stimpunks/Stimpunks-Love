#!/usr/bin/env python3
"""Check that every press-to-play facade on this street still plays, and still embeds.

Every press-to-play facade on this street is in one of the lists below. A facade
whose video has died looks exactly like one that works, right up until a reader
presses it and gets
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

AND PLAYING IS NOT THE SAME PERMISSION AS EMBEDDING, which nothing here knew
until the Jungle Room. A video can answer OK and still refuse to appear in an
iframe, because its owner switched embedding off: love-embed.js has no way to
tell, so it builds the frame and the reader gets a refusal where the picture
should be. That is the same failure as a dead id wearing a different face, and
it is read off the same page -- "playableInEmbed" beside the status. A cam the
data already marks 'link' is EXPECTED to fail this and is not reported; anything
else that fails it is a screen that does not work.

EVERY LIST, BECAUSE ROT DOES NOT CARE WHICH FILE AN ID LIVES IN. Each room with
facades in it has its own data file -- different provenance, so a different
_source sentence -- and a checker that only knew about data/jukebox.json would
have left the others unwatched while reporting "all tracks checked" in a tone of
complete confidence. That is worse than not running it, because it reads like
coverage. A new list of facades belongs in LISTS in the same commit that opens
the room.

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
so comparing them to oEmbed would fail on almost every row and mean nothing.
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
    """(status, embeddable) off one fetch of the watch page.

    status is OK / UNPLAYABLE / LOGIN_REQUIRED / ..., or None if we could not
    tell; embeddable is True/False/None the same way. Both come out of the same
    request rather than two, because they are two facts about one video and
    fetching twice would be asking somebody else's server for the same page for
    no reason."""
    try:
        html = get(f"https://www.youtube.com/watch?v={video_id}")
    except (urllib.error.URLError, TimeoutError, OSError):
        return None, None
    m = re.search(r'"playabilityStatus":\{"status":"([A-Z_]+)"', html)
    e = re.search(r'"playableInEmbed":(true|false)', html)
    return (m.group(1) if m else None), (e.group(1) == "true" if e else None)


def channel_now(video_id):
    q = urllib.parse.urlencode(
        {"url": f"https://www.youtube.com/watch?v={video_id}", "format": "json"})
    try:
        return json.loads(get("https://www.youtube.com/oembed?" + q))["author_name"]
    except Exception:
        return None


LISTS = [
    ("the dancefloor", "data/jukebox.json", "pink-pony-club.html"),
    ("the chappell",   "data/chappell.json", "the-chappell.html"),
    # The burrow's wireless and its television. A room with two facades in it is
    # exactly the size at which somebody decides a list is not worth adding to a
    # checker -- and a dead station in a room built for people who are already
    # flat is the worst place on the street to find rot.
    ("the latibulum",  "data/latibulum.json", "latibulum.html"),
    # The Hermitage's campfire. Feature-length documentaries on other people's
    # channels, which rot differently from a music video: a full episode is the
    # kind of upload a rights holder pulls, and the room's argument is that you
    # can decide what to give three hours to before you press.
    ("the hermitage",  "data/hermitage.json", "solarpunk-hermitage.html"),
    # The Jungle Room, which is the largest list here and the one most likely to
    # rot: a music video is published once and sits there, while a live camera
    # is a machine somebody is maintaining outdoors. Two of these were already
    # dead the day the room opened, on a page of ours that did not know it.
    ("the jungle room", "data/jungle.json",   "jungle-room.html"),
    # The Den, behind the Jungle Room. A discography rather than a list of ours,
    # which makes it the one set here where an id could rot into a DIFFERENT
    # recording of the same song rather than into nothing -- so the runtimes in
    # that file were matched against the released ones before they went in.
    ("the den",        "data/den.json",      "the-den.html"),
]


def tracks_in(data):
    """Every facade in one data file, whichever shape that file has.

    Three of these are a flat 'tracks' list. The Jungle Room's is grouped by
    cam type and The Den's by recording session, because in both cases the
    grouping carries something -- one is our events page's own order and the
    other is which night a song was cut. Flattening either here would be this
    tool quietly disagreeing with the room it is checking. The Jungle Room's is
    grouped,
    because the groups are our own events page's and re-sorting them into one
    list here would be this repo quietly disagreeing with a page it does not
    own. A file with neither key is refused rather than treated as empty: a run
    that silently checks nothing and prints a total is worse than not running.

    A cam marked dark is skipped. It is recorded as dead ON PURPOSE and does not
    render anywhere, so reporting it every time would be this tool shouting
    about a decision somebody already made -- which is how a report stops being
    read."""
    if "tracks" in data:
        return data["tracks"]
    if "groups" in data:
        return [dict(c, artist=c.get("artist") or c.get("channel"))
                for g in data["groups"] for c in g["cams"] if c.get("state") != "dark"]
    if "sessions" in data:
        return [t for s in data["sessions"] for t in s["tracks"]]
    # The Hermitage keeps its documentaries beside a shelf of books in one file,
    # because they are one room; only the docs are facades. A doc already
    # published as a door out is expected to fail the embed check and is not
    # reported, the same as the Jungle Room's link-outs.
    if "docs" in data:
        # 'how' is normalised to 'state' here rather than renamed in the data,
        # because the two files mean the same fact by different words and the
        # EXEMPTION BELOW KEYS ON state: a doc already published as a door out
        # is expected to fail the embed check, and reporting it every run would
        # be this tool shouting about a decision somebody already made. That is
        # how a report stops being read.
        return [dict(d, artist=d.get("channel"),
                     state="link" if d.get("how") == "link" else None)
                for d in data["docs"]]
    raise SystemExit(
        "REFUSING: a data file in LISTS has neither 'tracks' nor 'groups', so this "
        "run\nwould have checked none of it while reporting a confident total.")


def load():
    """Every track from every list, each carrying which room it belongs to.

    'artist' is per-track on the dancefloor and per-FILE in The Chappell, where
    all thirteen are one artist and repeating the name in every row would be
    noise. A file that gives neither is refused rather than defaulted: a report
    that names the wrong artist beside a DEAD is a report that sends somebody
    looking for the wrong video."""
    out = []
    for room, path, page in LISTS:
        data = json.loads((ROOT / path).read_text())
        for t in tracks_in(data):
            t = dict(t)
            t.setdefault("artist", data.get("_artist", ""))
            if not t["artist"]:
                raise SystemExit(
                    f"REFUSING: a track in {path} has no artist and the file has no "
                    "_artist\nto fall back on, so this run could not tell you which "
                    "video had died."
                )
            t["_room"], t["_file"], t["_page"] = room, path, page
            out.append(t)
    return out


def main():
    tracks = load()
    dead, unknown, drift, walled = [], [], [], []

    for i, t in enumerate(tracks):
        status, embeddable = playability(t["id"])
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

        # A cam the data already marks 'link' is published as a way out to
        # YouTube precisely BECAUSE its owner turned embedding off, so it is not
        # a finding. Anything else is a screen that would show a refusal.
        if embeddable is False and t.get("state") != "link":
            walled.append(t)
            mark = "WALL" if mark == "ok  " else mark

        print(f"{mark} {status or 'no answer':<14} {t['_room']:<14} "
              f"{t['artist']} — {t['title']}")
        expected = t.get("channel_verbatim", t["channel"])
        if chan and chan != expected:
            drift.append((t, expected, chan))

    if drift:
        print("\nchannel renamed since the id was extracted (not a failure):")
        for t, expected, now in drift:
            print(f"  {t['_file']}  {t['artist']}: recorded {expected!r} — now {now!r}")
        print("  If the new name is right, update 'channel_verbatim' (or 'channel' if there\n"
              "  is no verbatim field) so this stays quiet and the next rename is visible.")

    if walled:
        print("\nplays on YouTube, but its owner has embedding switched OFF — the facade\n"
              "would build an iframe and show a refusal where the picture should be:")
        for t in walled:
            print(f"  {t['_file']}  {t['artist']} — {t['title']}")
        print("  Give it a way out instead of a screen (state 'link' in the Jungle Room's\n"
              "  data), or replace it. Do not leave it as a button that cannot work.")

    rooms = ", ".join(f"{sum(1 for t in tracks if t['_room'] == r)} in {r}"
                      for r, _, _ in LISTS)
    print(f"\n{len(tracks)} facades checked ({rooms}), {len(dead)} not playable, "
          f"{len(walled)} not embeddable.")

    if unknown and len(unknown) == len(tracks):
        raise SystemExit(
            "\nREFUSING: not one track answered, so this says nothing about either room.\n"
            "That is almost certainly no network rather than every video on the street\n"
            "dying at once.\n"
            "Try again before believing anything here."
        )
    if unknown:
        print(f"{len(unknown)} track(s) gave no answer — inconclusive, not dead. Re-run those.")
    if dead:
        print(
            "\nA dead facade looks identical to a working one until somebody presses it.\n"
            "Find a replacement, put the new id in the data file named beside it above,\n"
            "with a 'replaced' note saying where it came from, and re-run that list's\n"
            "generator -- make-jukebox and make-liner-notes for the dancefloor,\n"
            "make-chappell for the chapel, make-latibulum for the burrow, make-jungle\n"
            "for the viewing room -- so every surface moves together.\n"
            "A dead NATURE CAM is different: the list it came from is our own events\n"
            "page, so mark it dark here and take the replacement up there."
        )
    sys.exit(1 if (dead or unknown or walled) else 0)


if __name__ == "__main__":
    main()
