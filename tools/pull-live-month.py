#!/usr/bin/env python3
"""Read the Live Room's studios' own channels and write the latest month of each,
for the month under the desk:

    tools/pull-live-month.py   -> data/live-room-month.json   (The Live Room)

Ryan's brief, 2026-10-15: the Live Room in the latest rack style, and the latest
month of videos from each studio's channel in addition to the desk somebody
patched in by hand. The studios are the ones on the desk -- Austin City Limits,
KEXP and KCRW -- and each is read off its own channel, never off a channel that
collects its recordings.

THIS TOUCHES THE NETWORK AND make-live-room.py DOES NOT, and they must not be
merged: pull-arrivals.py's rule for pull-arrivals.py's reason. A build that
cannot run on a train is a build that stops being run. It is run by
tools/daily-live.sh on the morning timer and by hand whenever somebody wants the
month refilled; it is kept out of tools/check-all.sh with the other pullers.

IT IS pull-nature-month.py's READING OF A FEED AND OF A WATCH PAGE, kept in step
with it by hand, the way that tool keeps in step with pull-large-month.py: all
of them read the same fields off the same pages. YouTube's feeds send no
Access-Control-Allow-Origin header, so a page cannot read them without a proxy
we do not run or YouTube's own script on every visitor's page before they have
pressed anything; so the month is filled by a machine somebody switched on, and
the room prints the minute it was filled.

IT PARTS FROM THAT TOOL IN ONE PLACE, AND KEXP IS WHY. A feed carries the
newest fifteen and no more, and KEXP puts up a whole session and each of its
songs on their own, about five videos a day: its feed reached back three days
when this was built (measured 2026-10-15). A feed whose fifteen do not join on
to what an earlier morning already covered has left a gap, and the old tool
would print that gap for a month while the mornings filled it in. So when a
feed does not reach back to what is covered, this reads the list's own page
instead and follows it past its first screen, pull-club.py's paging, up to
LIST_MOST ids, dating each new one off its watch page until one is older than
the month. Once the month is covered, a morning's feed joins on to it and the
list page is not asked.

WHAT IT READS, PER CHANNEL: both of the channel's own lists, derived from its
channel id -- UULF, its long-form uploads, and UUSH, its shorts. Then, FOR A
VIDEO IT HAS NOT SEEN BEFORE, one request to that video's watch page, the only
place that says whether it plays, whether it can be framed here, whether it is
age-gated, and how long it runs. Once per video, the morning it arrives.
check-jukebox.py asks again, for all of them, whenever somebody runs it.

WHAT IT TAKES: id, title as written, the channel's name as YouTube gives it,
when it was published, how long it runs, and which feed carried it. NOTHING
ELSE; make-live-room.py refuses a row carrying anything more. NOT WHERE IT WAS
PLAYED: nothing on a watch page says, and the desk is where that is checked.

WHAT IT REFUSES, and writes nothing when it does, so yesterday's month stands:

  · A FEED THAT DID NOT ANSWER, OR ANSWERED WITH SOMETHING THAT IS NOT AN ATOM
    FEED, AND A LIST PAGE THIS CANNOT READ. A channel changing or disappearing
    is news for a person, and a half-filled month published over it would hide
    the news.
  · A CHANNEL WITH NOTHING IN EITHER LIST. YouTube answers 404 for a list a
    channel has never had, which is an empty shelf rather than a fault, for
    either list; a channel with neither is gone or renamed.
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
DATA = ROOT / "data/live-room-month.json"
MAKER = "tools/make-live-room.py --month"
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")
PAUSE = 1.0          # be a guest on somebody else's server
TRIES = 4            # asks of a feed that answered 404 or 5xx, before believing it
RETRY_PAUSE = 6.0    # seconds between them
LIST_MOST = 320      # ids walked on a list's page, at most: KEXP's month is under two hundred
PAGES_MOST = 12      # continuations followed, at most: a ceiling rather than a while-true
MONTH = 30           # days kept; tools/make-live-room.py holds the same number
FEED_HOLDS = 15      # what YouTube's feed carries; fewer means it reached the start
FEEDS = (("long", "UULF"), ("short", "UUSH"))
YT = re.compile(r"^[A-Za-z0-9_-]{11}$")
CHANNEL = re.compile(r"^UC[A-Za-z0-9_-]{22}$")
NS = {"a": "http://www.w3.org/2005/Atom", "yt": "http://www.youtube.com/xml/schemas/2015"}


def die(msg):
    print("REFUSED: " + msg)
    print("Nothing was written; the month on the page is still the last one filled.")
    sys.exit(2)


def get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.status, r.read().decode("utf-8", "replace")


def post(url, body, timeout=25):
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={"User-Agent": UA, "Content-Type": "application/json", "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def utc(s):
    return datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(timezone.utc)


def iso(dt):
    return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def read_feed(src, form, prefix):
    if not CHANNEL.match(src.get("channel_id") or ""):
        die(f"{src.get('name')!r} has no channel id this can read ({src.get('channel_id')!r}).")
    url = f"https://www.youtube.com/feeds/videos.xml?playlist_id={prefix}{src['channel_id'][2:]}"
    # YOUTUBE ANSWERS 404 AND 500 INTERMITTENTLY, per request, for lists that
    # answer 200 a minute later: pull-nature-month.py measured it on 2026-10-11,
    # and this tool met it again the evening it was built, when KEXP's videos
    # feed answered 404 once and 200 the next time. So a 404 or a 5xx is asked
    # again, a few times and slowly, before it is believed.
    for attempt in range(TRIES):
        try:
            status, xml = get(url)
            break
        except urllib.error.HTTPError as e:
            if attempt < TRIES - 1 and (e.code == 404 or e.code >= 500):
                time.sleep(RETRY_PAUSE)
                continue
            err = e
            status, xml = None, None
            break
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if attempt < TRIES - 1:
                time.sleep(RETRY_PAUSE)
                continue
            die(f"{src['name']}'s {form} feed did not answer ({e}).\n         {url}")
    try:
        if status is None:
            raise err
    except urllib.error.HTTPError as e:
        # A FEED THAT STILL WILL NOT ANSWER IS ASKED THE OTHER WAY: the list's
        # own page, which says in its own markup what is on it, newest first.
        # A 404 might be an empty shelf (a channel that has never put up a
        # short) or YouTube's feeds being down, and the list page tells the two
        # apart: no ids on it is an empty shelf, and main() refuses a channel
        # whose shelves are both empty.
        if e.code == 404 or e.code >= 500:
            print(f"  ({src['name']}'s {form} feed would not answer; reading its list page instead)")
            return read_list(src, form, prefix)
        die(f"{src['name']}'s {form} feed answered {e.code}.\n         {url}")
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


class Listed(list):
    """Ids off a list's own page, newest first, with no dates on them yet:
    main() dates each one off its watch page and stops at the month's edge."""


def tokens_in(node, out):
    """Every continuation token anywhere inside a node. pull-club.py's reading,
    and its reason: a playlist page carries two continuation nodes, and the one
    that pages the videos is buried inside a commandExecutorCommand while the
    section list's sits at the tidy, obvious path. Reading the obvious path
    mirrors the first hundred and reports success."""
    if isinstance(node, dict):
        c = node.get("continuationCommand")
        if isinstance(c, dict) and c.get("token"):
            out.append(c["token"])
        for v in node.values():
            tokens_in(v, out)
    elif isinstance(node, list):
        for v in node:
            tokens_in(v, out)


def row_id(node):
    """A list row's video id, in any of the three shapes YouTube has used for
    one. playlistVideoRenderer is what pull-club.py was written against; by
    2026-10-15 a list page carried its long-form rows as lockupViewModel (the
    id is contentId, of contentType LOCKUP_CONTENT_TYPE_VIDEO) and its shorts
    as shortsLockupViewModel (the id is in the reel the row opens), and not one
    playlistVideoRenderer, so a walk that knew only the old shape read nothing
    and called the list empty."""
    r = node.get("playlistVideoRenderer")
    if isinstance(r, dict):
        return r.get("videoId")
    r = node.get("lockupViewModel")
    if isinstance(r, dict) and r.get("contentType") == "LOCKUP_CONTENT_TYPE_VIDEO":
        return r.get("contentId")
    r = node.get("shortsLockupViewModel")
    if isinstance(r, dict):
        cmd = ((r.get("onTap") or {}).get("innertubeCommand") or {})
        return (cmd.get("reelWatchEndpoint") or {}).get("videoId")
    return None


def walk(node, ids, conts):
    """Ids of the list's own rows, and its continuation tokens, out of any
    shape of response: walked rather than indexed by path, pull-club.py's
    reason. Only a list row's id is taken, so nothing the page recommends
    beside the list can arrive as one of the channel's own."""
    if isinstance(node, dict):
        vid = row_id(node)
        if YT.match(vid or "") and vid not in ids:
            ids.append(vid)
        # The continuation was a continuationItemRenderer when pull-club.py was
        # written and is a continuationItemViewModel by 2026-10-15; either holds
        # its token somewhere inside, which tokens_in finds wherever it is.
        for shape in ("continuationItemRenderer", "continuationItemViewModel"):
            c = node.get(shape)
            if isinstance(c, dict):
                tokens_in(c, conts)
        for v in node.values():
            walk(v, ids, conts)
    elif isinstance(node, list):
        for v in node:
            walk(v, ids, conts)


def read_list(src, form, prefix):
    url = f"https://www.youtube.com/playlist?list={prefix}{src['channel_id'][2:]}"
    for attempt in range(TRIES):
        try:
            status, page = get(url)
            break
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if attempt == TRIES - 1:
                die(f"{src['name']}'s {form} list page did not answer ({e}).\n         {url}")
            time.sleep(RETRY_PAUSE)
    if status != 200:
        die(f"{src['name']}'s {form} list page answered {status}.\n         {url}")
    key = re.search(r'"INNERTUBE_API_KEY":"([^"]+)"', page)
    ver = re.search(r'"INNERTUBE_CLIENT_VERSION":"([^"]+)"', page)
    data = re.search(r"var ytInitialData = (\{.*?\});</script>", page, re.S)
    if not data:
        die(f"{src['name']}'s {form} list page carries no ytInitialData, so this cannot read it. Teach it "
            f"the new page by hand, never on a timer.\n         {url}")
    ids, conts = [], []
    walk(json.loads(data.group(1)), ids, conts)
    first, paged = len(ids), 0
    spent = set()
    for _ in range(PAGES_MOST):
        conts = [t for t in conts if t not in spent]
        if not conts or len(ids) >= LIST_MOST or not (key and ver):
            break
        tok = conts.pop(0)
        spent.add(tok)
        time.sleep(PAUSE)
        try:
            more = post(f"https://www.youtube.com/youtubei/v1/browse?key={key.group(1)}",
                        {"context": {"client": {"clientName": "WEB", "clientVersion": ver.group(1)}},
                         "continuation": tok})
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as e:
            # A page further down that does not answer leaves the list shorter,
            # which main() treats as a list that stopped short of the month's
            # edge: the coverage starts at the oldest one read, never earlier.
            print(f"  ({src['name']}'s {form} list stopped paging at {len(ids)} ids: {e})")
            break
        walk(more, ids, conts)
        paged += 1
    out = Listed(ids[:LIST_MOST])
    # READ WHOLE ONLY WHEN THE LIST SAID SO: no token left, after a page that
    # held fewer than a page can or after following the list to its end. A
    # full first page with no token is a page whose token this did not find,
    # which is how the walk above first met continuationItemViewModel; that is
    # read as a list that stopped short, so the coverage starts at the oldest
    # one read and the gap is printed, never papered over.
    out.whole = not [t for t in conts if t not in spent] and (first < 100 or paged > 0)
    print(f"  read {src['name']}'s {form} list page: {len(out)} ids")
    return out


def watch(vid, with_date=False, page=None):
    """What the video's own page says about it, off one request. None if the
    page did not answer, which makes the video pending rather than refusing.
    pull-nature-month.py's reading, kept in step with it by hand: all of the
    pullers read the same fields off the same page. with_date also reads when
    it was published and its title, for a video found on a list's page rather
    than in a feed, and is None if the page does not say."""
    if page is None:
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
    if with_date:
        when = g(r'"publishDate":"([^"]+)"')
        title = g(r'"videoDetails":\{"videoId":"[A-Za-z0-9_-]{11}","title":"((?:[^"\\]|\\.)*)"')
        if not (when and title):
            return None
        base = watch(vid, page=page)
        if base is None:
            return None
        cid = g(r'"videoDetails":\{"videoId":"[A-Za-z0-9_-]{11}","title":"(?:[^"\\]|\\.)*","lengthSeconds":"\d+","keywords":\[.*?\],"channelId":"(UC[A-Za-z0-9_-]{22})"') \
            or g(r'"externalChannelId":"(UC[A-Za-z0-9_-]{22})"') or g(r'"channelId":"(UC[A-Za-z0-9_-]{22})"')
        return dict(base, published=iso(datetime.fromisoformat(when)), title=json.loads(f'"{title}"'), cid=cid)
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


def joins(spans, oldest, edge):
    """Whether an earlier morning already covered from the month's edge up to
    the oldest entry this morning's feed carried, so the feed joins on to it.
    A minute of slack, The Open Notebook's: the edge is worked out to the
    second and a span may have been written a few seconds after it."""
    return any(utc(a) <= edge + timedelta(minutes=1) and utc(b) >= oldest for a, b in spans)


def main():
    data = json.loads(DATA.read_text())
    now = datetime.now(timezone.utc).replace(microsecond=0)
    keep_from = now - timedelta(days=MONTH)
    sources = data["sources"]
    by_id = {v["id"]: v for v in data.get("log", [])}
    covered = data.get("covered") or {}

    # EVERY FEED FIRST, before anything is written or any watch page is asked,
    # so a refusal part-way leaves the file exactly as it was.
    read = {}
    for src in sources:
        for form, prefix in FEEDS:
            got = read_feed(src, form, prefix)
            if not isinstance(got, Listed):
                print(f"  read {src['name']}, {form}: {len(got)} entries")
                if len(got) >= FEED_HOLDS:
                    oldest = utc(min(e["published"] for e in got))
                    if oldest > keep_from and not joins(covered.get(src["slug"], {}).get(form, []),
                                                        oldest, keep_from):
                        print(f"  ({src['name']}'s {form} feed reached back only to {iso(oldest)} and "
                              "does not join on to what is covered; reading its list page)")
                        time.sleep(PAUSE)
                        got = read_list(src, form, prefix)
            read[(src["slug"], form)] = got
            time.sleep(PAUSE)
        if not any(read[(src["slug"], f)] for f, _ in FEEDS):
            # (For a list read off its page, these are ids; dated below.)
            die(f"{src['name']} has nothing in either its videos or its shorts. A channel "
                "with neither is gone or renamed, which is news for a person.")

    asked = 0
    # A LIST READ OFF ITS PAGE comes with no dates, so each new id is dated off
    # its own watch page, newest first, until one is older than the month; a
    # video already in the log keeps the date it has. What is read becomes the
    # same entries a feed would have given, and the coverage below is worked out
    # from them the same way.
    owner_of = {(src["slug"], form): src["channel_id"] for src in sources for form, _ in FEEDS}
    for key, entries in list(read.items()):
        if not isinstance(entries, Listed):
            continue
        dated, reached = [], False
        for vid in entries:
            old = by_id.get(vid)
            if old and old.get("state") != "pending" and old.get("published"):
                e = {"id": vid, "title": old["title"], "published": old["published"]}
            else:
                w = watch(vid, with_date=True)
                asked += 1
                time.sleep(PAUSE)
                if w is None:
                    continue                # asked again next morning
                if w.get("cid") != owner_of[key]:
                    continue                # not this channel's: a stray id on the page
                e = {"id": vid, "title": w["title"], "published": w["published"],
                     "_w": {k: v for k, v in w.items() if k not in ("cid", "published", "title")}}
            dated.append(e)
            if utc(e["published"]) < keep_from:
                reached = True
                break
        if reached or getattr(entries, "whole", False):
            # It reached the month's edge, or read the whole list: the month is
            # all here, as with a feed that held fewer than it can.
            read[key] = dated
        else:
            # Stopped short of the edge: padding to a full feed's length makes
            # the coverage start at the oldest one read, not at the month's start.
            read[key] = dated + [{"pad": True}] * max(0, FEED_HOLDS - len(dated))

    for src in sources:
        cov = covered.setdefault(src["slug"], {})
        for form, _ in FEEDS:
            raw = read[(src["slug"], form)]
            entries = [e for e in raw if not e.get("pad")]
            # WHAT THIS READING PROVES WE HAVE SEEN ALL OF: from the oldest entry
            # it carried up to now -- or from the start of the month, if the feed
            # held fewer than it can, which means it reached the start of the list.
            if not entries:
                start = iso(keep_from)
            elif len(raw) < FEED_HOLDS or utc(min(e["published"] for e in entries)) < keep_from:
                start = iso(keep_from)
            else:
                start = min(e["published"] for e in entries)
            spans = [list(s) for s in cov.get(form, [])] + [[start, iso(now)]]
            cov[form] = [s for s in merge(spans) if s[1] >= iso(keep_from)]
            for e in entries:
                if utc(e["published"]) < keep_from:
                    continue
                old = by_id.get(e["id"])
                if old and old.get("state") != "pending":
                    old["title"] = e["title"]      # a channel may retitle; keep theirs
                    continue
                if "_w" in e:
                    w = e["_w"]
                else:
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
    print(f"Now run {MAKER} to put them under the desk.")


if __name__ == "__main__":
    main()
