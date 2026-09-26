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
    # The Mopery's parlour screen: one song, several times over, and eight of
    # the nine are somebody's cover on somebody's own channel -- which is the
    # kind of upload that goes away without anybody deciding it should. One of
    # them is an acknowledged unofficial re-upload of a soundtrack cut and is
    # by some distance the most likely thing on this street to vanish.
    ("the mopery",     "data/mopery.json",   "the-mopery.html"),
    # The Hermitage's campfire. Feature-length documentaries on other people's
    # channels, which rot differently from a music video: a full episode is the
    # kind of upload a rights holder pulls, and the room's argument is that you
    # can decide what to give three hours to before you press.
    ("the hermitage",  "data/hermitage.json", "solarpunk-hermitage.html"),
    # Club Chronic's record rack. The largest single list on the street and the
    # most likely to rot in a way nobody notices: thirty-six songs on other
    # people's channels, a lot of them small labels and one-person uploads,
    # which is exactly where a video goes private without ceremony.
    ("club chronic",   "data/club.json", "club-chronic.html"),
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
    # The Pebble Board, which rots differently from everything above it: these
    # are not ours and were not curated for longevity -- they are whatever
    # somebody had open on the day, which is the point of the room and also the
    # reason a private video was already among them the first time this ran.
    # EVERY EDITION, not just the one on the board: a back issue is still a
    # published page, and a link that dies after an edition rotates off is a
    # dead link on a page nobody is looking at any more, which is worse.
    ("the pebble board", "data/pebble-board.json", "pebble-board.html"),
    # Swaying Sweetgrass, and it is the only list here with TWO KINDS OF ROT in
    # it. The fire is institutional channels -- a museum, a university, a
    # publisher -- which are about the most stable uploads on this street. The
    # chapter readings are an unauthorised recording of a book that is in
    # copyright, published as doors out precisely because of that, and they are
    # the likeliest thing on the whole site to be taken down by somebody with
    # every right to take it down. When one goes, that is not a broken page to
    # patch quietly: it is the rights holder acting, and the room should say so.
    ("swaying sweetgrass", "data/sweetgrass.json", "swaying-sweetgrass.html"),
    # The Rabbit Hole. FOUR OF THESE SEVEN ARE RE-UPLOADS ON INDIVIDUALS'
    # CHANNELS -- a Woodstock set, a television appearance taken off a DVD, a
    # trailer edit nobody signed, and a festival recording -- which is the most
    # rot-prone shape of upload on this street after the Pebble Board's. Three
    # of the seven are a label's or the artist's own and will outlive us. The
    # room states which is which on every plate, so a death here changes a
    # sentence as well as a link.
    ("the rabbit hole", "data/rabbit-hole.json", "rabbit-hole.html"),
    # Black Leather Lagoon, off The Outskirts. One band, all on their own artist
    # channel, which is about as durable as an upload gets here -- but a tenth
    # song was already pulled from this rack before it shipped for answering
    # LOGIN_REQUIRED rather than OK, which is a state this tool reports and
    # nothing else on the street had met. Age-gating can be switched on after
    # the fact, and when it is, the button still looks perfect.
    ("black leather lagoon", "data/lagoon.json", "black-leather-lagoon.html"),
    # Looming Rocks Amphitheatre, two turnings along the same road. THIS ENTRY
    # WAS MISSING FOR A DAY, which is the gap this tool's own docstring warns
    # about in as many words: a new list of facades belongs in LISTS in the same
    # commit that opens the room, because a checker that reports "all tracks
    # checked" while silently not knowing about a room reads as coverage and is
    # worse than not running.
    ("looming rocks", "data/looming-rocks.json", "looming-rocks.html"),
    # Laughingstock's bill. Added in the commit that opened the room, for the
    # reason above. The stage beside it is a playlist and is not checked here,
    # for the reason this tool gives about the club's: a playlist is not one
    # video -- and its FIRST entry is on the bill, which is the one row that
    # decides whether the whole night embeds at all.
    ("laughingstock", "data/laughingstock.json", "laughingstock.html"),
    # The Lightbulb Picture House. Both screens are playlists and are not checked
    # as playlists, for the reason above; every film on BOTH is checked as a film,
    # including Screen Two's, which has no rack but is named in the room.
    ("the picture house", "data/picture-house.json", "lightbulb-picture-house.html"),
    # Dance, Punks, off The Outskirts. The crate is a playlist and is not checked
    # as one, for the reason above; what IS checked is the song each channel
    # opens on, because a channel is a starting video and a dead one is a
    # headset that opens on YouTube's refusal plate. Added in the commit that
    # opened the room, which is the lesson Looming Rocks' missing day taught.
    ("dance, punks", "data/dance-punks.json", "dance-punks.html"),
    # Vital Plant Living's stereo. The playlist itself is not checked, for the
    # reason above; every song listed under it is, because the list is a mirror
    # and a dead row is a credit for a song the stereo no longer plays. The
    # hidden entry YouTube reports is not here and cannot be: nobody but the
    # playlist's owner can see which video it is. Added in the commit that
    # opened the room.
    ("vital plant living", "data/vital.json", "vital-plant-living.html"),
    # The Live Room's desk, one strip per session, grouped by studio. Added in
    # the commit that opened the room. Five of its first nine are on channels
    # that collect recordings rather than the show's own, which is the shape
    # this tool is really for.
    ("the live room", "data/live-room.json", "live-room.html"),
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
    # THE LIVE ROOM IS TESTED BEFORE 'sessions', because its studios hold
    # sessions and The Den's file is keyed on 'sessions' at the top. A file with
    # 'studios' is the Live Room's; its sessions are one video each.
    if "studios" in data:
        return [dict(s_, artist=s_.get("who") or s_.get("channel"))
                for st in data["studios"] for s_ in st["sessions"]]
    if "groups" in data:
        return [dict(c, artist=c.get("artist") or c.get("channel"))
                for g in data["groups"] for c in g["cams"] if c.get("state") != "dark"]
    if "sessions" in data:
        return [t for s in data["sessions"] for t in s["tracks"]]
    # The Hermitage keeps its documentaries beside a shelf of books in one file,
    # because they are one room; only the docs are facades. A doc already
    # published as a door out is expected to fail the embed check and is not
    # reported, the same as the Jungle Room's link-outs.
    # Club Chronic files its songs in racks, because the racks carry the
    # argument. THE TWO PLAYLISTS ON THAT STAGE ARE NOT HERE and that is not an
    # oversight: this tool asks a watch page about one video, and a playlist is
    # not one video. Checking them would mean a different request against a
    # different endpoint, and pretending the existing check covers them would be
    # the confident-total problem again.
    # The Pebble Board files its pins by edition and then by drawer. Flattened
    # here, because an id is an id whichever edition it was pinned in -- what is
    # NOT flattened is the dropped list, which is deliberately full of things
    # that no longer play and would report as rot on every run.
    if "editions" in data:
        # 'video' rather than 'id' in that file, because a pin is a card first
        # and a video second -- most of them are not videos at all. Mapped here
        # rather than renamed in the data: the field name says what the board
        # means, and this tool wants what every other list calls it.
        # 'how' is normalised to 'state' the way the Hermitage's is, because the
        # embed exemption below keys on 'state': a pin already published as a
        # door out is EXPECTED to refuse the frame, and reporting it every run
        # would be this tool shouting about a decision somebody already made.
        return [dict(c, id=c["video"], artist=c.get("credit"),
                     state="link" if c.get("how") == "link" else None)
                for e in data["editions"] for s in e.get("sections", [])
                for c in s.get("cards", []) if c.get("video")]
    # Swaying Sweetgrass keeps three lists in one file because they carry three
    # different rights statements, which is the room's whole argument -- see
    # data/sweetgrass.json. All three are checked: the readings are marked
    # 'link' and so are exempt from the embed check, the way the Jungle Room's
    # link-outs are, but a DEAD one still matters and matters differently.
    if "fire" in data:
        # THE READINGS CARRY NO 'channel' OF THEIR OWN AND MUST NOT BE GIVEN
        # ONE. All twenty-one are on one channel, and that name is stored once
        # at _readings_channel because it is the WALL make-sweetgrass.py uses to
        # tell a reading from a talk -- a talk on the readings' channel and a
        # reading on a talk's are both refused there, and the channel is the
        # only thing that ever told those ids apart. Twenty-one copies of it
        # would be twenty-one chances for one row to disagree with the wall and
        # switch that check off quietly, which is the hand-kept copy this repo
        # refuses everywhere else.
        #
        # SO THE FALLBACK IS RESOLVED HERE, WHERE THE SHAPE IS KNOWN, AND ON
        # 'channel' RATHER THAN ONLY ON 'artist'. It was on artist alone, so
        # every run printed the right name in the row and then compared the
        # drift against None and reported all twenty-one as renamed -- for
        # months, on a report whose own docstring says that a report which is
        # always noisy is a report nobody reads. The generic comparison below
        # stays generic; this function's whole job is knowing what shape a file
        # is in.
        walled = data.get("_readings_channel")
        return [dict(t, artist=t.get("channel") or walled,
                     channel=t.get("channel") or walled,
                     state="link" if t.get("how") == "link" else None)
                for t in (data.get("fire", []) + data.get("readings", [])
                          + data.get("teachings", []))]
    if "racks" in data:
        return [dict(s, artist=s.get("artist") or s.get("channel"))
                for r in data["racks"] for s in r["songs"]]
    if "docs" in data or "solar_watch" in data:
        # THE HERMITAGE HAS FACADES IN TWO PLACES IN ONE FILE -- the campfire's
        # documentaries and the solar bench's videos -- and the first version of
        # this branch returned only the first list. That is the same shape of
        # hole make-yurt-sound.py was widened to close: a guard that covers the
        # thing it was written for and not the thing added next to it, reporting
        # a confident total the whole time. Both lists, or neither.
        #
        # 'how' is normalised to 'state' rather than renamed in the data, because
        # the two files mean the same fact by different words and the EXEMPTION
        # BELOW KEYS ON state: a doc already published as a door out is expected
        # to fail the embed check, and reporting it every run would be this tool
        # shouting about a decision somebody already made.
        return [dict(d, artist=d.get("channel"),
                     state="link" if d.get("how") == "link" else None)
                for d in (data.get("docs", []) + data.get("solar_watch", []))]
    # LAUGHINGSTOCK IS TESTED BEFORE LOOMING ROCKS, AND THE ORDER IS THE FIX.
    # Its data file carries 'acts' too -- the comics and their lines in the
    # light, which are people rather than videos -- and this branch used to sit
    # after the 'acts' one, so the comics were read as videos, came back with
    # no artist, and the whole run refused before checking a single track. It
    # did that from the day the room opened until 2026-09-23. A file with
    # 'sets' is Laughingstock's whatever else it holds.
    if "sets" in data:
        # Laughingstock's bill. A set can have more than one comic on it, and
        # every one of them wrote it, so the report names them all rather than
        # the channel -- a report that names the shop beside a DEAD sends
        # somebody looking in the wrong place.
        return [dict(s_, artist=" and ".join(s_.get("comics") or []) or s_.get("channel"))
                for s_ in data["sets"]]
    if "acts" in data:
        # Looming Rocks' running order. SIX OF THE TEN ARE THE ARTIST'S OR THE
        # BAND'S OWN CHANNEL, which is about the most durable upload this tool
        # watches; the other four are on channels that collect live recordings,
        # and those are the ones that actually rot. It is also the list with the
        # most to lose per row: these are full concerts, so a dead id here is
        # not a three-minute disappointment, it is somebody clearing two hours
        # for a video that has gone.
        return [dict(a_, artist=a_.get("who") or a_.get("channel"),
                     state="link" if a_.get("how") == "link" else None)
                for a_ in data["acts"]]
    if "songs" in data:
        # Black Leather Lagoon's rack. A FLAT LIST OF ONE BAND, which makes it
        # the least rot-prone set on this street and the one where rot would be
        # hardest to spot: every id is on the artist's own channel, so nothing
        # here is going away the way a one-person upload does -- and precisely
        # because of that, a row that DID die would sit there looking exactly as
        # respectable as the eight beside it. The room's screen is a playlist and
        # is not checked here, for the reason this tool gives about the club's:
        # a playlist is not one video.
        return [dict(s_, artist=s_.get("channel")) for s_ in data["songs"]]
    if "rack" in data:
        # The Lightbulb Picture House: the rack for Screen One and the named list
        # for Screen Two. Both, for the Hermitage's reason -- a guard that covers
        # the list it was written for and not the one beside it reports a
        # confident total while missing half the room.
        return [dict(f, artist=f.get("channel"))
                for f in (data.get("rack", []) + data.get("screen_two", []))]
    if "channels" in data:
        # Dance, Punks: each channel is the song it OPENS on, then the crate
        # plays on from there. Only the opening song is one video; the rest is
        # the playlist, which this tool does not pretend to check.
        return [dict(c["opens"], title=f'channel {c["n"]}, opening on {c["opens"]["title"]}')
                for c in data["channels"]]
    if "cuts" in data:
        # The Mopery's parlour screen: ONE SONG, several times over, so what
        # every other list calls the artist is the performer here and the song
        # is the same on every row. 'how' is normalised to 'state' the way the
        # Hermitage's and the board's are, because the embed exemption below
        # keys on 'state'.
        return [dict(c, artist=c.get("channel"),
                     state="link" if c.get("how") == "link" else None)
                for c in data["cuts"]]
    raise SystemExit(
        "REFUSING: a data file in LISTS has none of the shapes this tool knows, so "
        "this\nrun would have checked none of it while reporting a confident total.")


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
        # `t.get("channel_verbatim", t["channel"])` is what this was, and the
        # default in a .get() is evaluated EAGERLY -- so it raised KeyError on
        # the first list that carries only the verbatim name, even though the
        # verbatim name was right there. It never showed up because every list
        # until the Pebble Board happened to have both keys.
        expected = t.get("channel_verbatim") or t.get("channel")
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
