#!/usr/bin/env python3
"""Pull the ids of Club Chronic's YouTube playlist, so the stage can drop the
needle at a random point in it.

WHY THERE IS A LIST OF IDS HERE AT ALL, AND WHY IT IS NOT A NUMBER. YouTube's
embed cannot be told to shuffle and cannot be told to start at a POSITION.
Measured on 2026-09-22, framed from a served page so the referrer was real:

  - shuffle=1 .......................... inert. Shuffled frame and plain frame
                                         side by side, three loads, same
                                         opening track every time.
  - index=0 / 1 / 2 / 999 on videoseries inert.
  - index=3 on the listType=playlist form inert.
  - /embed/<VIDEO_ID>?list=<PLAYLIST> .. WORKS. Starting id 2Srr_x2TCtI opened
                                         on Tiny Stills while the control
                                         opened on Grumpster.

All four were checked with muted autoplay rather than by looking at the poster,
because the poster is the playlist's first entry whatever the player then does
-- the first pass of this measurement read the thumbnails and would have
reported index= as working.

So the only lever that exists takes an ID, and a random start therefore needs
the playlist's contents mirrored here. That is a real cost and it was taken
with the cost stated: Ryan's call, 2026-09-22, after the cheaper version was
shown not to exist. THE MIRROR DRIFTS BY DESIGN -- a song added to the playlist
will never be picked as a start point until somebody runs this again, and a
song removed from it becomes an id that opens a video the list no longer has.
Neither is visible on the page. `--check` is the only thing that sees it.

WHAT IT REFUSES TO MIRROR: an entry YouTube marks unplayable. A private or
deleted row still comes back in the playlist's own data with isPlayable false,
and mirroring one would put a dead start point in the rotation -- a button that
a reader presses and gets nothing from, which is make-chappell.py's typo that
never becomes a video arriving through a curation change nobody here made.

NOT PART OF THE PRE-DEPLOY RUN, for check-jukebox.py's reason: it needs the
network, and a build that cannot run on a train stops being run. It is also a
separate tool from make-club.py for pull-arrivals.py's reason -- one touches
the network and one draws the room. DO NOT MERGE THEM.

AND IT IS NOT IN check-jukebox.py, which says in its own source why: that tool
asks a WATCH page about one video, and a playlist is not one video. Checking
520 start ids one watch page at a time would take a quarter of an hour and
still miss the failure that matters, which is not a video dying but a video
leaving the list. That failure is visible in one request to the playlist, which
is the request this makes.

  pull-club.py            rewrite data/club.json from the live playlist
  pull-club.py --check    report drift and exit 1; change nothing
"""
import json
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/club.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
PAUSE = 1.0  # be a guest on somebody else's server
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def post(url, body, timeout=25):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={"User-Agent": UA, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def tokens_in(node, out):
    """Every continuation token anywhere inside a node.

    NOT a fixed path, and that is the whole reason this function exists. A
    playlist page carries TWO continuation nodes: one for the video list and
    one for the section list around it. The video list's token -- the only one
    that pages the songs -- is buried inside a commandExecutorCommand, while
    the section list's sits at the tidy, obvious
    continuationEndpoint.continuationCommand.token. Reading the obvious path
    got the wrong token, mirrored the first hundred rows of five hundred and
    twenty, and reported success. A short list is not an error anywhere."""
    if isinstance(node, dict):
        c = node.get("continuationCommand")
        if isinstance(c, dict) and c.get("token"):
            out.append(c["token"])
        for v in node.values():
            tokens_in(v, out)
    elif isinstance(node, list):
        for v in node:
            tokens_in(v, out)


def walk(node, rows, conts):
    """Collect playlist rows and continuation tokens from any shape of response.

    Walked rather than indexed by path: the first page nests its rows under
    tabs/sectionList/itemSection and a continuation response nests them under
    onResponseReceivedActions, and hard-coding either path is a tool that works
    until YouTube moves a key and then silently mirrors nothing."""
    if isinstance(node, dict):
        r = node.get("playlistVideoRenderer")
        if isinstance(r, dict) and YT.match(r.get("videoId") or ""):
            rows.append((r["videoId"], r.get("isPlayable")))
        c = node.get("continuationItemRenderer")
        if isinstance(c, dict):
            tokens_in(c, conts)
        for v in node.values():
            walk(v, rows, conts)
    elif isinstance(node, list):
        for v in node:
            walk(v, rows, conts)


def live_ids(list_id):
    """(rows, what the playlist header claims) -- and the two disagree.

    make-chappell.py met this first: a playlist header counts entries that
    YouTube then hides from everyone but the owner, so the number on the page
    and the number that plays are different numbers. Both are returned and both
    are written down, because rounding one off would leave a tool reporting a
    total it had not seen."""
    html = get(f"https://www.youtube.com/playlist?list={list_id}")
    m = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', html)
    v = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', html)
    d = re.search(r"var ytInitialData = (\{.*?\});</script>", html, re.S)
    if not (m and v and d):
        raise SystemExit(
            "REFUSING: could not read the playlist page's own data. Nothing was "
            "written. This is usually a throttled or variant response and clears "
            "on a re-run -- it happened once on the afternoon this was built -- "
            "so try again before concluding YouTube has moved a key. What it "
            "must never do is carry on and mirror a short list, because a short "
            "list is not an error anywhere.")
    key, ver = m.group(1), v.group(1)
    rows, conts = [], []
    walk(json.loads(d.group(1)), rows, conts)
    seen = {i for i, _ in rows}
    spent = set()
    # A ceiling rather than a while-true. A continuation that keeps handing back
    # a token is somebody else's server in a loop, and a tool that follows it
    # for ever is a tool nobody can interrupt.
    for _ in range(200):
        conts = [t for t in conts if t not in spent]
        if not conts:
            break
        tok = conts.pop(0)
        spent.add(tok)
        time.sleep(PAUSE)
        page = post(
            f"https://www.youtube.com/youtubei/v1/browse?key={key}",
            {"context": {"client": {"clientName": "WEB", "clientVersion": ver}},
             "continuation": tok})
        more, conts2 = [], []
        walk(page, more, conts2)
        fresh = [(i, p) for i, p in more if i not in seen]
        rows.extend(fresh)
        seen.update(i for i, _ in fresh)
        conts.extend(conts2)
    claimed = re.search(r'"([\d,]+) videos"', html)
    return rows, int(claimed.group(1).replace(",", "")) if claimed else None


def main():
    check = "--check" in sys.argv[1:]
    data = json.loads(DATA.read_text())
    pl = next((p for p in data["playlists"] if p.get("slug") == "youtube"), None)
    if not pl:
        raise SystemExit("REFUSING: data/club.json has no youtube playlist on the stage.")
    m = re.search(r"[?&]list=([A-Za-z0-9_-]+)", pl.get("frame") or "")
    if not m:
        raise SystemExit("REFUSING: that playlist's frame carries no list id.")

    rows, claimed = live_ids(m.group(1))
    if not rows:
        raise SystemExit("REFUSING: the playlist came back empty. Nothing was written.")
    playable = [i for i, ok in rows if ok is not False]
    dropped = len(rows) - len(playable)
    # A SONG IN THE PLAYLIST TWICE IS ONE START POINT, and that is not this tool
    # overruling somebody's curation. The repeats are real -- nine of them the
    # first time this ran, each with its own setVideoId, so the list genuinely
    # holds those songs twice and one of them three times. But a start point is
    # a VIDEO, not a position: /embed/<id>?list= opens at the first occurrence
    # whichever one you meant, so a second copy cannot be reached and only
    # doubles that song's odds in the draw. Order is kept so the file still
    # reads down the playlist.
    good, seen_ids = [], set()
    for i in playable:
        if i not in seen_ids:
            good.append(i)
            seen_ids.add(i)
    repeats = len(playable) - len(good)

    stored = pl.get("starts") or []
    gone = [i for i in stored if i not in set(good)]
    added = [i for i in good if i not in set(stored)]

    if check:
        print(f"club chronic: the live playlist serves {len(rows)} rows "
              f"(its own header claims {claimed}); {dropped} unplayable, not "
              f"mirrored; data/club.json holds {len(stored)}.")
        if not gone and not added:
            print("  no drift. Every stored start point is still in the list.")
            return 0
        for i in gone:
            print(f"  GONE    {i} is a stored start point that the playlist no longer has.")
        for i in added:
            print(f"  ADDED   {i} is in the playlist and can never be picked as a start.")
        print("Run tools/pull-club.py to mirror it again, then tools/make-club.py.")
        return 1

    pl["starts"] = good
    pl["starts_pulled"] = date.today().isoformat()
    pl["_starts"] = (
        "THE PLAYLIST'S OWN IDS, mirrored by tools/pull-club.py so the stage can "
        "start somewhere random. The embed cannot shuffle and cannot take a "
        "position -- only /embed/<id>?list=<playlist> moves the starting point, "
        "which is why this is a list of ids rather than a count. It DRIFTS: a "
        "song added to the playlist cannot be picked until somebody pulls "
        "again, and a song removed becomes a start point the list no longer "
        "has. `pull-club.py --check` is the only thing that sees either. "
        "Unplayable rows are left out on purpose -- a private entry still comes "
        "back here and would be a press that becomes nothing. "
        f"On {date.today().isoformat()} the playlist's own header claimed "
        f"{claimed} videos and YouTube served {len(rows)} to anybody who is not "
        "its owner -- make-chappell.py's discrepancy, written down rather than "
        "rounded off. The hidden rows are not marked unplayable, they are "
        "simply absent, so the isPlayable guard above dropped none of them. "
        "Songs the playlist holds more than once appear here once: a start "
        "point is a video rather than a position, so the second copy opens the "
        "same place as the first and would only double that song's odds.")
    DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"club chronic: {len(good)} start points mirrored from {len(rows)} rows "
          f"served ({dropped} unplayable and {repeats} repeat(s) left out). The "
          f"playlist's own header claims {claimed}; YouTube hides the rest from "
          "everyone but the owner.")
    if gone:
        print(f"  {len(gone)} stored start point(s) had left the list and are gone from the file.")
    if added:
        print(f"  {len(added)} new one(s) can now be picked.")
    print("Now run tools/make-club.py.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
