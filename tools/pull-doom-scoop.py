#!/usr/bin/env python3
"""Read every source's feed and write this week's scoops into data/doom-scoop.json.

THIS TOUCHES THE NETWORK AND make-doom-scoop.py DOES NOT, and they must not be
merged: pull-arrivals.py's rule for pull-arrivals.py's reason. A build that
cannot run on a train is a build that stops being run. This is run by
tools/daily-scoop.sh on the morning timer and by hand whenever somebody wants the
cabinet refilled; it is kept out of tools/check-all.sh with the other pullers.

WHY THE SCOOP IS SET BY A TIMER AND SAYS SO. YouTube's feeds send no
Access-Control-Allow-Origin header, so a page cannot read them, and the ways round
that are a proxy we do not run or YouTube's own script on every visitor's page
before they have pressed anything -- which is the one thing this street's
press-to-play mechanism exists to refuse. So the cabinet is filled by a machine
somebody switched on, and the room prints the minute it was filled. The Feed's
argument, arriving in a room that also embeds.

WHAT IT READS, PER SOURCE: YouTube's own feed for the exact list Ryan linked --
the channel's long-form list, its shorts, or a playlist -- which carries each
video's id, title and publication time. Then, FOR A VIDEO IT HAS NOT SEEN
BEFORE, one request to that video's watch page, which is the only place that
says whether it plays, whether it can be framed here, whether it is age-gated,
and how long it runs. That is check-jukebox.py's test, run once per video on the
morning it arrives rather than on every video every morning: a scoop is kept for
a week, and asking somebody else's server the same question about the same video
seven times would be rude for no gain. check-jukebox.py asks again, for all of
them, whenever somebody runs it.

WHAT IT TAKES: id, title as written, the channel's name as YouTube gives it,
when it was published, and how long it runs. NOTHING ELSE -- no description, no
thumbnail, no view count. See data/doom-scoop.json's `_scoops` for why each is
left behind; make-doom-scoop.py refuses a scoop carrying any of them.

WHAT IT REFUSES, and writes nothing when it does, so yesterday's cabinet stands:

  · A FEED THAT DID NOT ANSWER, OR ANSWERED WITH NOTHING, OR WITH SOMETHING THAT
    IS NOT AN ATOM FEED. A source changing format or disappearing is news for a
    person, and a half-filled cabinet published over it would hide the news.
  · AN ENTRY WITH NO ID, NO TITLE OR NO PUBLICATION TIME, because a scoop is
    dated by the morning it belongs to and cannot be filed without one.

A WATCH PAGE THAT DOES NOT ANSWER IS NOT A REFUSAL. That video is kept as
`pending` and asked again next morning. One slow page is not a reason to leave
a whole week's cabinet unfilled; one missing feed is.

THE WINDOW AND THE WEEK are data/doom-scoop.json's `_window` and `_week`. The
arithmetic is here and nowhere else, and make-doom-scoop.py reads the dates this
writes rather than working them out again.
"""
import html
import json
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/doom-scoop.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
PAUSE = 1.0          # be a guest on somebody else's server
HERE = ZoneInfo("America/Denver")   # where the timer that sets it runs
CUT = 5              # an edition closes at five in the morning, Mountain time
WEEK = 7             # mornings kept; the eighth is gone
FEED_HOLDS = 15      # what YouTube's feed carries; fewer means it reached the start
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def die(msg):
    print("REFUSED: " + msg)
    print("Nothing was written; the cabinet on the page is still the last one filled.")
    sys.exit(2)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def edition_of(dt):
    """The morning a moment belongs to: anything from five the morning before up
    to five this morning, Mountain time, is this morning's."""
    local = dt.astimezone(HERE) - timedelta(hours=CUT)
    return (local.date() + timedelta(days=1)).isoformat()


def closed_by(dt):
    """The newest morning whose five o'clock has come by this moment."""
    return (dt.astimezone(HERE) - timedelta(hours=CUT)).date().isoformat()


def window_start(edition):
    d = datetime.fromisoformat(edition).replace(tzinfo=HERE) - timedelta(days=1)
    return d.replace(hour=CUT)


def read_feed(src):
    url = f"https://www.youtube.com/feeds/videos.xml?playlist_id={src['feed']}"
    try:
        status, xml = get(url)
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        die(f"{src['name']}'s feed did not answer ({e}).\n         {url}")
    if status != 200:
        die(f"{src['name']}'s feed answered {status}.\n         {url}")
    try:
        root = ET.fromstring(xml)
    except ET.ParseError as e:
        die(f"{src['name']}'s feed is not XML this can read ({e}).\n         {url}")
    if root.tag != "{http://www.w3.org/2005/Atom}feed":
        die(f"{src['name']}'s feed is not an Atom feed.\n         {url}")
    out = []
    for e in root.findall("a:entry", NS):
        vid = (e.findtext("yt:videoId", "", NS) or "").strip()
        title = html.unescape((e.findtext("a:title", "", NS) or "").strip())
        pub = (e.findtext("a:published", "", NS) or "").strip()
        if not (YT.match(vid) and title and pub):
            die(f"{src['name']}'s feed has an entry with no id, title or date "
                f"({vid!r}, {title[:40]!r}, {pub!r}).")
        out.append({"id": vid, "title": title, "published": iso(utc(pub))})
    if not out:
        die(f"{src['name']}'s feed answered with nothing in it.\n         {url}")
    return out


def watch(vid):
    """What the video's own page says about it, off one request. None if the
    page did not answer, which makes the video pending rather than refusing."""
    try:
        _, page = get(f"https://www.youtube.com/watch?v={vid}")
    except (urllib.error.URLError, TimeoutError, OSError):
        return None

    def g(rx):
        m = re.search(rx, page)
        return m.group(1) if m else None

    status = g(r'"playabilityStatus":\{"status":"([A-Z_]+)"')
    embed = g(r'"playableInEmbed":(true|false)')
    length = g(r'"lengthSeconds":"(\d+)"')
    upcoming = g(r'"isUpcoming":(true|false)') == "true"
    live_now = g(r'"isLiveNow":(true|false)') == "true" or g(r'"isLive":(true|false)') == "true"
    owner = g(r'"ownerChannelName":"((?:[^"\\]|\\.)*)"')
    if owner:
        owner = json.loads(f'"{owner}"')
    if status is None:
        return None
    if upcoming or live_now or status == "LIVE_STREAM_OFFLINE" or (status == "OK" and not int(length or 0)):
        return {"state": "pending", "why": "live, or not out yet"}
    if status == "LOGIN_REQUIRED":
        return {"state": "door", "why": "age-gated", "runs": int(length or 0) or None, "channel": owner}
    if status != "OK":
        return {"state": "gone", "why": status.lower()}
    if embed != "true":
        return {"state": "door", "why": "no embedding", "runs": int(length), "channel": owner}
    return {"state": "screen", "runs": int(length), "channel": owner}


def merge(spans):
    spans = sorted(spans)
    out = []
    for a, b in spans:
        if out and a <= out[-1][1]:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def main():
    data = json.loads(DATA.read_text())
    now = datetime.now(timezone.utc).replace(microsecond=0)
    newest = closed_by(now)
    oldest = (datetime.fromisoformat(newest) - timedelta(days=WEEK - 1)).date().isoformat()
    keep_from = window_start(oldest)

    by_id = {s["id"]: s for s in data.get("scoops", [])}
    sources = [s for g in data["groups"] for s in g["sources"] if s.get("feed")]

    # EVERY FEED FIRST, before anything is written or any watch page is asked,
    # so a refusal part-way leaves the file exactly as it was.
    read = {}
    for src in sources:
        read[src["slug"]] = read_feed(src)
        print(f"  read {src['name']}: {len(read[src['slug']])} entries")
        time.sleep(PAUSE)

    asked = 0
    covered = data.get("covered") or {}
    for src in sources:
        entries = read[src["slug"]]
        # WHAT THIS READING PROVES WE HAVE SEEN ALL OF: from the oldest entry it
        # carried up to now -- or from the beginning, if the feed held fewer than
        # it can, which means it reached the start of the list.
        start = iso(keep_from) if len(entries) < FEED_HOLDS else min(e["published"] for e in entries)
        spans = [list(s) for s in covered.get(src["slug"], [])] + [[start, iso(now)]]
        covered[src["slug"]] = [s for s in merge(spans) if s[1] >= iso(keep_from)]
        for e in entries:
            if utc(e["published"]) < keep_from:
                continue
            old = by_id.get(e["id"])
            if old and old.get("state") != "pending":
                old["title"] = e["title"]          # a channel may retitle; keep theirs
                continue
            w = watch(e["id"])
            asked += 1
            time.sleep(PAUSE)
            row = {"id": e["id"], "source": src["slug"], "title": e["title"],
                   "published": e["published"], "edition": edition_of(utc(e["published"]))}
            if w is None:
                row.update(state="pending", why="the watch page did not answer")
            else:
                row.update({k: v for k, v in w.items() if v is not None})
            if old and old.get("source") != src["slug"]:
                continue                            # the first source to carry it keeps it
            by_id[e["id"]] = row

    # THE MORNING A SCOOP BELONGS TO IS WORKED OUT AGAIN FOR EVERY ROW, every run,
    # from when it was published. It is arithmetic on a stored fact, so moving
    # the cut moves every scoop to the right morning rather than only new ones.
    for s in by_id.values():
        s["edition"] = edition_of(utc(s["published"]))
    scoops = [s for s in by_id.values() if s["edition"] >= oldest]
    scoops.sort(key=lambda s: (s["edition"], s["published"], s["id"]))
    data["scoops"] = scoops
    data["covered"] = covered
    data["set"] = now.strftime("%Y-%m-%dT%H:%MZ")
    data["newest"] = newest
    DATA.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")

    states = {}
    for s in scoops:
        states[s["state"]] = states.get(s["state"], 0) + 1
    print(f"\nWrote {DATA.relative_to(ROOT)}: set {data['set']}, newest morning {newest}, "
          f"{asked} watch pages asked, " + ", ".join(f"{v} {k}" for k, v in sorted(states.items())))
    print("Now run tools/make-doom-scoop.py to fill the cabinet itself.")


if __name__ == "__main__":
    main()
