#!/usr/bin/env python3
"""Ask YouTube's search for this week's videos about cities and towns making room
for green, and write the newest of them into data/the-green-latest.json, for the
second rack under the porch roof on the Green.

THIS TOUCHES THE NETWORK AND make-the-green.py DOES NOT, and they must not be
merged: pull-arrivals.py's rule for pull-arrivals.py's reason. A build that
cannot run on a train is a build that stops being run. This is run by
tools/daily-green.sh on the morning timer and by hand whenever somebody wants
the rack refilled; it is kept out of tools/check-all.sh with the other pullers.

IT IS THE FIRST PULLER HERE THAT READS A SEARCH RATHER THAN A FEED. Every other
rack on the street is a channel somebody chose. A search has no feed, so this
reads the results page, which carries its own data as `ytInitialData`. YouTube
no longer sorts a search by upload date (the old sort answers in relevance
order, measured 2026-10-07); what it still has is the upload-date FILTER, so
each search asks for videos put up this week, and the watch page of each new
result says when it went up, to the second. Newest is worked out here from
that, never from the results page's "3 days ago".

WHAT IT READS, PER SEARCH: one results page, filtered to videos put up this week
(sp=CAISBAgDEAE%3D, which is YouTube's own filter: this week, videos). Then, FOR
A RESULT WHOSE TITLE CARRIES ITS SEARCH'S WORDS AND THAT IT HAS NOT SEEN BEFORE,
one request to that video's watch page, the only place that says whether it
plays, whether it can be framed here, whether it is age-gated, how long it runs,
when it went up and what its channel filed it under. Once per video, the morning
it first turns up. check-jukebox.py asks again, for the rack, whenever somebody
runs it.

WHAT GOES ON THE RACK, and data/the-green-latest.json's `_rules` says it in full:
put up in the last week; its title carries its search's words; it plays here;
its channel did not file it under Gaming or Music; one per channel and no title
twice. Each search takes a turn, in Ryan's order, newest first, until the rack
holds RACK. A turn rather than the newest twenty overall, because a busy search
would otherwise be the whole rack and a quiet one never on it.

WHAT IT TAKES: id, title as written, the channel's name as YouTube gives it,
when it was published, how long it runs, which search found it, and, for a
result left off, why. NOTHING ELSE. make-the-green.py refuses a row carrying
anything more.

WHAT IT REFUSES, and writes nothing when it does, so yesterday's rack stands:

  · A SEARCH PAGE THAT DID NOT ANSWER, OR ANSWERED WITHOUT ITS DATA. YouTube
    changing the page is news for a person, and a rack filled from half the
    searches would hide the news.
  · A SEARCH WITH NO RESULTS AT ALL. A week with nothing whose title says urban
    forest is a quiet week; a page with no videos on it at all is a page this
    no longer understands.
  · A RESULT WITH NO ID OR NO TITLE.

A WATCH PAGE THAT DOES NOT ANSWER IS NOT A REFUSAL. That video is kept as
`pending` and asked again if a search turns it up again.
"""
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data/the-green-latest.json"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
PAUSE = 1.0          # be a guest on somebody else's server
WEEK = 7             # days kept; make-the-green.py reads this one
RACK = 20            # Ryan's number; make-the-green.py reads this one
THIS_WEEK = "CAISBAgDEAE%3D"   # YouTube's own filter: upload date this week, type video
LEFT_OFF = {"Gaming", "Music"}  # make-the-green.py reads this one
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
DATA_RX = re.compile(r'(?:var ytInitialData|window\["ytInitialData"\]) = (\{.*?\});\s*</script>', re.S)


def die(msg):
    print("REFUSED: " + msg)
    print("Nothing was written; the rack on the page is still the last one filled.")
    sys.exit(2)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def words(s):
    """A title as the gate reads it: lower case, every run of spaces and hyphens
    one space, so Solar-Punk and solar  punk are solar punk."""
    return re.sub(r"[\s\-‐-―]+", " ", s.casefold()).strip()


def carries(title, has):
    t = words(title)
    return any(words(h) in t for h in has)


def renderers(data):
    out = []

    def walk(o):
        if isinstance(o, dict):
            for k, v in o.items():
                if k == "videoRenderer":
                    out.append(v)
                else:
                    walk(v)
        elif isinstance(o, list):
            for x in o:
                walk(x)
    walk(data)
    return out


def text(t):
    if not t:
        return ""
    if "simpleText" in t:
        return t["simpleText"]
    return "".join(r.get("text", "") for r in t.get("runs", []))


def search(s):
    url = ("https://www.youtube.com/results?"
           + urllib.parse.urlencode({"search_query": s["q"], "hl": "en", "gl": "US"})
           + "&sp=" + THIS_WEEK)
    try:
        status, page = get(url)
    except urllib.error.HTTPError as e:
        die(f"the search for {s['q']!r} answered {e.code}.\n         {url}")
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        die(f"the search for {s['q']!r} did not answer ({e}).\n         {url}")
    if status != 200:
        die(f"the search for {s['q']!r} answered {status}.\n         {url}")
    m = DATA_RX.search(page)
    if not m:
        die(f"the search for {s['q']!r} answered without its data. YouTube may have changed the "
            f"page, or asked for consent.\n         {url}")
    try:
        found = renderers(json.loads(m.group(1)))
    except json.JSONDecodeError as e:
        die(f"the search for {s['q']!r} carried data this cannot read ({e}).\n         {url}")
    if not found:
        die(f"the search for {s['q']!r} has no videos on it at all, which is a page this no longer "
            f"understands rather than a quiet week.\n         {url}")
    out = []
    for v in found:
        vid, title = v.get("videoId") or "", text(v.get("title")).strip()
        if not (YT.match(vid) and title):
            die(f"the search for {s['q']!r} has a result with no id or no title ({vid!r}, {title[:40]!r}).")
        out.append({"id": vid, "title": html.unescape(title)})
    return out


def watch(vid):
    """What the video's own page says about it, off one request. None if the
    page did not answer. pull-large-month.py's reading, kept in step with it by
    hand, plus the three things a search needs that a channel's feed already
    said: when it went up, whose it is, and what its channel filed it under."""
    try:
        _, page = get(f"https://www.youtube.com/watch?v={vid}")
    except (urllib.error.URLError, TimeoutError, OSError):
        return None

    def g(rx):
        m = re.search(rx, page)
        return m.group(1) if m else None

    def s(rx):
        raw = g(rx)
        return json.loads(f'"{raw}"') if raw is not None else None

    status = g(r'"playabilityStatus":\{"status":"([A-Z_]+)"')
    embed = g(r'"playableInEmbed":(true|false)')
    length = g(r'"lengthSeconds":"(\d+)"')
    upcoming = g(r'"isUpcoming":(true|false)') == "true"
    live_now = g(r'"isLiveNow":(true|false)') == "true" or g(r'"isLive":(true|false)') == "true"
    owner = s(r'"ownerChannelName":"((?:[^"\\]|\\.)*)"')
    category = s(r'"category":"((?:[^"\\]|\\.)*)"')
    published = g(r'"publishDate":"([^"]+)"') or g(r'"uploadDate":"([^"]+)"')
    if status is None:
        return None
    if upcoming or live_now or status == "LIVE_STREAM_OFFLINE" or (status == "OK" and not int(length or 0)):
        return {"state": "pending", "why": "live, or not out yet"}
    if status == "LOGIN_REQUIRED":
        return {"state": "door", "why": "age-gated"}
    if status != "OK":
        return {"state": "gone", "why": status.lower()}
    if not published or not owner:
        return {"state": "pending", "why": "its page did not say when it went up or whose it is"}
    if len(published) == 10:                 # a day with no time on it is midnight UTC
        published += "T00:00:00+00:00"
    row = {"channel": owner, "published": iso(datetime.fromisoformat(published)), "runs": int(length)}
    if embed != "true":
        return dict(row, state="door", why="no embedding")
    if category in LEFT_OFF:
        return dict(row, state="left", why=f"filed under {category}")
    return dict(row, state="screen")


def choose(searches, seen, since):
    """Each search takes a turn, newest first, until the rack is full."""
    pool = {s["key"]: sorted((v for v in seen if v["search"] == s["key"] and v["state"] == "screen"
                              and utc(v["published"]) >= since and carries(v["title"], s["has"])),
                             key=lambda v: (v["published"], v["id"]), reverse=True)
            for s in searches}
    rack, titles, channels = [], set(), set()
    while len(rack) < RACK and any(pool.values()):
        for s in searches:
            q = pool[s["key"]]
            while q:
                v = q.pop(0)
                if words(v["title"]) in titles or v["channel"].casefold() in channels:
                    continue
                titles.add(words(v["title"]))
                channels.add(v["channel"].casefold())
                rack.append({k: v[k] for k in ("id", "title", "channel", "published", "runs", "search")})
                break
            if len(rack) == RACK:
                break
    rack.sort(key=lambda v: (v["published"], v["id"]), reverse=True)
    return rack


def main():
    data = json.loads(DATA.read_text())
    now = datetime.now(timezone.utc).replace(microsecond=0)
    since = now - timedelta(days=WEEK)
    searches = data["searches"]
    keys = {s["key"] for s in searches}
    seen = {v["id"]: v for v in data.get("seen", []) if v.get("search") in keys}

    # EVERY SEARCH FIRST, before anything is written or any watch page is asked,
    # so a refusal part-way leaves the file exactly as it was.
    results = {}
    for s in searches:
        results[s["key"]] = search(s)
        gated = sum(carries(r["title"], s["has"]) for r in results[s["key"]])
        print(f"  searched {s['q']!r}: {len(results[s['key']])} results, {gated} whose title says so")
        time.sleep(PAUSE)

    asked = 0
    taken = set()
    for s in searches:
        for r in results[s["key"]]:
            if r["id"] in taken or not carries(r["title"], s["has"]):
                continue
            taken.add(r["id"])
            old = seen.get(r["id"])
            if old and old.get("state") != "pending":
                old["title"] = r["title"]          # a channel may retitle; keep theirs
                continue
            w = watch(r["id"])
            asked += 1
            time.sleep(PAUSE)
            row = {"id": r["id"], "search": old["search"] if old else s["key"], "title": r["title"]}
            if w is None:
                row.update(state="pending", why="the watch page did not answer")
            else:
                row.update(w)
            seen[r["id"]] = row

    # A week, and nothing older. A pending row has no date of its own yet, so it
    # is kept only while a search still turns it up.
    kept = [v for v in seen.values()
            if (v.get("published") and utc(v["published"]) >= since)
            or (not v.get("published") and v["id"] in taken)]
    order = {s["key"]: i for i, s in enumerate(searches)}
    kept.sort(key=lambda v: (order[v["search"]], v.get("published") or "", v["id"]))
    data["seen"] = kept
    data["latest"] = choose(searches, kept, since)
    data["set"] = now.strftime("%Y-%m-%dT%H:%MZ")
    DATA.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")

    states = {}
    for v in kept:
        states[v["state"]] = states.get(v["state"], 0) + 1
    print(f"\nWrote {DATA.relative_to(ROOT)}: set {data['set']}, {asked} watch pages asked, "
          f"{len(data['latest'])} on the rack; of the week's results, "
          + ", ".join(f"{n} {k}" for k, n in sorted(states.items())))
    print("Now run tools/make-the-green.py --latest to put them on the rack.")


if __name__ == "__main__":
    main()
