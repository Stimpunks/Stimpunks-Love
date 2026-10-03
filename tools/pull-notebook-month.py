#!/usr/bin/env python3
"""Read every journaling channel's feeds and write the last month of their videos
into data/open-notebook-month.json, for the monthly log in The Open Notebook.

THIS TOUCHES THE NETWORK AND make-open-notebook.py DOES NOT, and they must not be
merged: pull-arrivals.py's rule for pull-arrivals.py's reason. A build that
cannot run on a train is a build that stops being run. This is run by
tools/daily-notebook.sh on the morning timer and by hand whenever somebody wants
the log refilled; it is kept out of tools/check-all.sh with the other pullers.

IT IS pull-vital-rack.py WITH JOURNALING CHANNELS IN PLACE OF COOKS, and its
reading of a feed and of a watch page is that tool's, kept in step with it by
hand, the way pull-vital-rack.py keeps in step with pull-doom-scoop.py: all
three read the same fields off the same pages. YouTube's feeds send no
Access-Control-Allow-Origin header, so a page cannot read them without a proxy
we do not run or YouTube's own script on every visitor's page before they have
pressed anything; so the log is filled by a machine somebody switched on, and
the room prints the minute it was filled.

WHAT IT READS, PER CHANNEL: both of the channel's own lists, derived from its
channel id -- UULF, its long-form uploads, and UUSH, its shorts, because Ryan's
brief was the last month's worth of each channel, whatever tab his link was on.
Then, FOR A VIDEO IT HAS NOT SEEN BEFORE, one request to that video's watch
page, the only place that says whether it plays, whether it can be framed here,
whether it is age-gated, and how long it runs. Once per video, the morning it
arrives. check-jukebox.py asks again, for all of them, whenever somebody runs it.

WHAT IT TAKES: id, title as written, the channel's name as YouTube gives it,
when it was published, how long it runs, and which feed carried it. NOTHING
ELSE. See data/open-notebook-month.json's `_log`; make-open-notebook.py refuses
a row carrying anything more.

WHAT IT REFUSES, and writes nothing when it does, so yesterday's log stands:

  · A FEED THAT DID NOT ANSWER, OR ANSWERED WITH SOMETHING THAT IS NOT AN ATOM
    FEED. A channel changing or disappearing is news for a person, and a
    half-filled log published over it would hide the news.
  · A CHANNEL WITH NOTHING IN EITHER LIST. HERE IS WHERE IT PARTS FROM THE
    COOKS' PULLER: every cook on the telly puts up long-form videos, so that
    tool refuses an empty long-form list, and some of these channels are made
    of shorts. YouTube answers 404 for a list a channel has never had, which is
    an empty shelf rather than a fault, for either list. A channel with neither
    is refused, because that is a channel gone or renamed.
  · AN ENTRY WITH NO ID, NO TITLE OR NO PUBLICATION TIME.

A WATCH PAGE THAT DOES NOT ANSWER IS NOT A REFUSAL. That video is kept as
`pending` and asked again next morning.
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

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/open-notebook-month.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
PAUSE = 1.0          # be a guest on somebody else's server
MONTH = 30           # days kept; make-open-notebook.py holds the same number
FEED_HOLDS = 15      # what YouTube's feed carries; fewer means it reached the start
FEEDS = (("long", "UULF"), ("short", "UUSH"))
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def die(msg):
    print("REFUSED: " + msg)
    print("Nothing was written; the log on the page is still the last one filled.")
    sys.exit(2)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def read_feed(src, form, prefix):
    if not CHANNEL.match(src.get("channel_id") or ""):
        die(f"{src.get('name')!r} has no channel id this can read ({src.get('channel_id')!r}).")
    url = f"https://www.youtube.com/feeds/videos.xml?playlist_id={prefix}{src['channel_id'][2:]}"
    try:
        status, xml = get(url)
    except urllib.error.HTTPError as e:
        # A channel that has never put up a short, or never anything but
        # shorts, has no list of that kind at all, and YouTube answers 404 for
        # it. That is an empty shelf, not a fault; main() refuses a channel
        # whose shelves are both empty.
        if e.code == 404:
            return []
        die(f"{src['name']}'s {form} feed answered {e.code}.\n         {url}")
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        die(f"{src['name']}'s {form} feed did not answer ({e}).\n         {url}")
    if status != 200:
        die(f"{src['name']}'s {form} feed answered {status}.\n         {url}")
    try:
        root = ET.fromstring(xml)
    except ET.ParseError as e:
        die(f"{src['name']}'s {form} feed is not XML this can read ({e}).\n         {url}")
    if root.tag != "{http://www.w3.org/2005/Atom}feed":
        die(f"{src['name']}'s {form} feed is not an Atom feed.\n         {url}")
    out = []
    for e in root.findall("a:entry", NS):
        vid = (e.findtext("yt:videoId", "", NS) or "").strip()
        title = html.unescape((e.findtext("a:title", "", NS) or "").strip())
        pub = (e.findtext("a:published", "", NS) or "").strip()
        if not (YT.match(vid) and title and pub):
            die(f"{src['name']}'s {form} feed has an entry with no id, title or date "
                f"({vid!r}, {title[:40]!r}, {pub!r}).")
        out.append({"id": vid, "title": title, "published": iso(utc(pub))})
    return out


def watch(vid):
    """What the video's own page says about it, off one request. None if the
    page did not answer, which makes the video pending rather than refusing.
    pull-vital-rack.py's reading, kept in step with it by hand: all three
    pullers read the same fields off the same page."""
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
    keep_from = now - timedelta(days=MONTH)
    sources = data["sources"]
    by_id = {v["id"]: v for v in data.get("log", [])}

    # EVERY FEED FIRST, before anything is written or any watch page is asked,
    # so a refusal part-way leaves the file exactly as it was.
    read = {}
    for src in sources:
        for form, prefix in FEEDS:
            read[(src["slug"], form)] = read_feed(src, form, prefix)
            print(f"  read {src['name']}, {form}: {len(read[(src['slug'], form)])} entries")
            time.sleep(PAUSE)
        if not any(read[(src["slug"], f)] for f, _ in FEEDS):
            die(f"{src['name']} has nothing in either its videos or its shorts. A channel "
                "with neither is gone or renamed, which is news for a person.")

    asked = 0
    covered = data.get("covered") or {}
    for src in sources:
        cov = covered.setdefault(src["slug"], {})
        for form, _ in FEEDS:
            entries = read[(src["slug"], form)]
            # WHAT THIS READING PROVES WE HAVE SEEN ALL OF: from the oldest entry
            # it carried up to now -- or from the start of the month, if the feed
            # held fewer than it can, which means it reached the start of the list.
            start = iso(keep_from) if len(entries) < FEED_HOLDS else min(e["published"] for e in entries)
            spans = [list(s) for s in cov.get(form, [])] + [[start, iso(now)]]
            cov[form] = [s for s in merge(spans) if s[1] >= iso(keep_from)]
            for e in entries:
                if utc(e["published"]) < keep_from:
                    continue
                old = by_id.get(e["id"])
                if old and old.get("state") != "pending":
                    old["title"] = e["title"]      # a channel may retitle; keep theirs
                    continue
                w = watch(e["id"])
                asked += 1
                time.sleep(PAUSE)
                row = {"id": e["id"], "source": src["slug"], "form": form,
                       "title": e["title"], "published": e["published"]}
                if w is None:
                    row.update(state="pending", why="the watch page did not answer")
                else:
                    row.update({k: v for k, v in w.items() if v is not None})
                if old and old.get("source") != src["slug"]:
                    continue                        # the first channel to carry it keeps it
                by_id[e["id"]] = row

    rows = [v for v in by_id.values() if utc(v["published"]) >= keep_from]
    order = {s["slug"]: i for i, s in enumerate(sources)}
    rows.sort(key=lambda v: (order.get(v["source"], 99), v["form"], v["published"], v["id"]))
    data["log"] = rows
    data["covered"] = {k: v for k, v in covered.items() if k in order}
    data["set"] = now.strftime("%Y-%m-%dT%H:%MZ")
    DATA.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")

    states = {}
    for v in rows:
        states[v["state"]] = states.get(v["state"], 0) + 1
    print(f"\nWrote {DATA.relative_to(ROOT)}: set {data['set']}, {asked} watch pages asked, "
          + ", ".join(f"{n} {k}" for k, n in sorted(states.items())))
    print("Now run tools/make-open-notebook.py --month to put them in the log.")


if __name__ == "__main__":
    main()
