#!/usr/bin/env python3
"""Set The Source's terraces out of data/the-source.json, and the springs the
CB's feed bot reads for the room's channel.

THE SOURCE IS BEHIND THE FEED, and shares nothing with it but the subject. The
Feed is a hall of boards saying what has arrived on every site we publish; The
Source is the hillside above it, where every one of those sites is made. Each
repository is a pool on white terraces under a warm spring, and every commit is
a deposit on it, because a terrace like that is laid down by the water that
runs over it, a thin skin of stone at a time.

pull-source.py is the half that reads GitHub, and this one needs nothing but
the file, for pull-arrivals.py's reason. DO NOT MERGE THEM.

WHAT THE ROOM IS CLAIMING, which is what this file is guarding:

  · A DEPOSIT IS A COMMIT'S FIRST LINE, ITS SHORT ID, ITS TIME, WHOSE HANDS
    AND WHERE IT GOES. Never the rest of its message, which is The Feed's rule
    about the contents of the train: a summary field is REFUSED, not dropped.
  · WHOSE HANDS IS EVERY NAME THE COMMIT GIVES, its author and anybody its
    message names in a Co-Authored-By line, because attribution is the habit
    this street kept loudest. GitHub names an author only when the address a
    commit was made with is an account's; where it names nobody, the row says
    so, and an address is never shown.
  · EVERY DEPOSIT IS A COMMIT IN ITS OWN POOL'S REPOSITORY. A pool with a name
    on it holding somebody else's water reads as a claim: make-hermitage.py's
    rule about the Star Stuff bench.
  · THE SPRINGS ARE STIMPUNKS.ORG'S, IN ITS ORDER. Read against the Knowledge
    System mirror's copy of the feeds page when the mirror is on this machine:
    every GitHub commit feed under Latest Commits to Our Repositories is a
    spring here, in that order, and nothing else is.
  · THE MORNING TIMERS' COMMITS ARE LEFT OFF, by the `skip` pattern, and the
    pattern is refused unless it matches every subject tools/daily-*.sh commits
    under. A new timer whose subject it missed would put a dozen machine
    commits on the terraces and on the channel every morning.
  · NOTHING IS RANKED AND NOBODY'S COMMITS ARE COUNTED. No busiest repository,
    no most commits, nobody's total: a board of who did the most work would
    turn the making into a race between our own people, most of whom are
    Disabled and several of whom are one person. The Feed's vocabulary sweep,
    imported from make-arrivals.py, with its negation window.

AND IT WRITES THE SPRINGS INTO netlify/cb/lib.mjs, between the
feed-bot:the-source markers, with the skip pattern, so the room's terraces and
its channel are never about different repositories.

IF THIS REFUSES: fix the cause. Do not loosen the tool.
"""
import html
import importlib.util
import json
import random
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "the-source.json"
PAGE = ROOT / "the-source.html"
LIB = ROOT / "netlify" / "cb" / "lib.mjs"
MIRROR = Path.home() / "Documents/Claude/Projects/Stimpunks Knowledge System/site/stimpunks.org"

BODY_FIELDS = ("summary", "description", "excerpt", "content", "body", "blurb", "message", "extract")

spec = importlib.util.spec_from_file_location("arrivals", ROOT / "tools" / "make-arrivals.py")
arrivals = importlib.util.module_from_spec(spec)
spec.loader.exec_module(arrivals)


def die(msg):
    raise SystemExit(f"REFUSING: {msg}")


def e(s):
    return html.escape(str(s), quote=True)


def slot(src, name, markup):
    begin, end = f"<!-- source:{name}:begin -->", f"<!-- source:{name}:end -->"
    if src.count(begin) != 1 or src.count(end) != 1:
        die(f"the-source.html has no single {begin} … {end} pair.")
    a, b = src.index(begin), src.index(end) + len(end)
    return src[:a] + begin + "\n" + markup + end + src[b:]


def stamp(iso):
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%MZ").replace(tzinfo=timezone.utc)
    return f"{dt.strftime('%H:%M')} UTC on {dt.day} {dt.strftime('%B %Y')}"


def day(iso):
    dt = datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ")
    return f"{dt.day} {dt.strftime('%B %Y')}"


def hands(it):
    names = (["somebody GitHub does not name"] if it.get("anon") else []) + [e(b) for b in it["by"]]
    if not names:
        return "GitHub names nobody"
    return "by " + (names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1])


# ── The hillside ─────────────────────────────────────────────────────────────
# White terraces stepping down a hill under a warm spring, from a fixed seed so
# the same hill is drawn every build. Every pool is a crescent, the rows offset
# by half a pool like scales, as travertine lays them; every rim has a hard
# shadow straight under it and the stone face of the terrace below that,
# streaked where iron in the water stains it, with water spilling over the
# lowest point of the rim. NOTHING IN IT IS STRAIGHT: the terraces are laid
# down by water, which is what holds this room off the boards next door. Drawn
# only in the --src- colours, and aria-hidden, because the paragraphs under the
# name say what it shows.
def f(n):
    return f"{n:.1f}".rstrip("0").rstrip(".")


def lens(a, b, y, dip, back):
    """A pool: its back edge an arc rising behind it, its rim an arc below."""
    m = (a + b) / 2
    return f"M{f(a)} {f(y)} Q{f(m)} {f(y - back)} {f(b)} {f(y)} Q{f(m)} {f(y + dip)} {f(a)} {f(y)} Z"


def hillside():
    rnd = random.Random(1781)
    W, H, cx = 960, 380, 480
    out = [f'<svg class="src-hill" viewBox="0 0 {W} {H}" role="presentation" aria-hidden="true" focusable="false">',
           f'<rect width="{W}" height="{H}" fill="var(--src-sky)"/>',
           '<path d="M-20 380 L-20 300 C 110 236 250 124 376 74 C 432 54 528 54 584 74 '
           'C 710 124 850 236 980 300 L980 380 Z" fill="var(--src-curtain)"/>']
    # Each row: the line its pools' cusps sit on, and how far either side of
    # the middle it reaches. A row's pools are offset half a pool from the
    # row above, so no pool is lined up with the one over it.
    rows_at = [(100, 70), (160, 190), (220, 310), (280, 430), (340, 560)]
    rows = []
    for r, (y, span) in enumerate(rows_at):
        width = rnd.uniform(118, 150)
        x = cx - span - (width / 2 if r % 2 else 0)
        pools = []
        while x < cx + span:
            w = rnd.uniform(width * .82, width * 1.18)
            pools.append((x, min(x + w, cx + span + w * .5), rnd.uniform(40, 52), rnd.uniform(8, 12)))
            x += w
        rows.append((y, pools))

    def surfaces(y, pools):
        for a, b, dip, back in pools:
            out.append(f'<path d="{lens(a, b, y, dip, back)}" fill="var(--src-pool)"/>')
            ia, ib = a + (b - a) * .2, b - (b - a) * .2
            out.append(f'<path d="{lens(ia, ib, y - 1, dip * .42, back)}" fill="var(--src-deep)"/>')

    def faces(y, pools, low):
        for a, b, dip, back in pools:
            m = (a + b) / 2
            rim = f"M{f(a)} {f(y)} Q{f(m)} {f(y + dip)} {f(b)} {f(y)}"
            drips, x = [], b
            while x > a:
                x = max(a, x - rnd.uniform(8, 15))
                drips.append(f" L{f(x)} {f(low + rnd.uniform(0, 6))}")
            out.append(f'<path d="{rim} L{f(b)} {f(low)}{"".join(drips)} Z" fill="var(--src-curtain)"/>')
            for _ in range(rnd.randint(2, 4)):
                x = rnd.uniform(a + 8, b - 8)
                t = (x - a) / (b - a)
                top = y + 2 * t * (1 - t) * dip
                out.append(f'<path d="M{f(x)} {f(top + 8)} V{f(top + 8 + (low - top - 8) * rnd.uniform(.3, .8))}" '
                           f'stroke="var(--src-shade)" stroke-width="1.6" stroke-linecap="round"/>')
            if rnd.random() < .4:
                x = rnd.uniform(a + 12, b - 12)
                t = (x - a) / (b - a)
                top = y + 2 * t * (1 - t) * dip
                bend = rnd.uniform(-4, 4)
                out.append(f'<path d="M{f(x)} {f(top + 4)} Q{f(x + bend)} {f((top + low) / 2)} {f(x - bend / 2)} '
                           f'{f(top + (low - top) * rnd.uniform(.55, .95))}" fill="none" stroke="var(--src-iron)" '
                           f'stroke-width="{f(rnd.uniform(2.6, 4))}" stroke-linecap="round"/>')
            # Water over the rim at its lowest point.
            out.append(f'<path d="M{f(m)} {f(y + dip / 2 + 4)} V{f(low - 2)}" stroke="var(--src-pool)" '
                       f'stroke-width="3" stroke-linecap="round"/>')
            # The hard shadow straight under the lip, then the lip itself.
            out.append(f'<path d="M{f(a)} {f(y + 6)} Q{f(m)} {f(y + 6 + dip)} {f(b)} {f(y + 6)}" fill="none" '
                       f'stroke="var(--src-shade)" stroke-width="7" stroke-linecap="round"/>')
            out.append(f'<path d="{rim}" fill="none" stroke="var(--src-lip)" stroke-width="5" stroke-linecap="round"/>')

    # The spring, at the top of the hill, where all of it starts.
    out.append(f'<path d="{lens(cx - 50, cx + 50, 66, 30, 28)}" fill="var(--src-pool)"/>')
    out.append(f'<path d="{lens(cx - 24, cx + 24, 68, 14, 12)}" fill="var(--src-deep)"/>')
    surfaces(*rows[0])
    for r, (y, pools) in enumerate(rows):
        if r + 1 < len(rows):
            surfaces(*rows[r + 1])
        faces(y, pools, rows[r + 1][0] - 5 if r + 1 < len(rows) else H)
    out.append(f'<path d="M{cx - 50} 66 Q{cx} 96 {cx + 50} 66" fill="none" stroke="var(--src-lip)" '
               f'stroke-width="5" stroke-linecap="round"/>')
    out.append("</svg>")
    return "\n".join(out) + "\n"


# ── One pool for one repository ──────────────────────────────────────────────
def pool(sp, far):
    rows = []
    for it in sp["items"]:
        rows.append(
            f'      <li class="deposit"><a class="deposit__what" href="{e(it["url"])}">{e(it["title"])}</a>'
            f'<span class="deposit__how"><span class="deposit__id">{e(it["sha"])}</span> &middot; '
            f'<time datetime="{e(it["date"])}">{day(it["date"])}</time> &middot; {hands(it)}</span></li>'
        )
    feed_short = sp["feed"].removeprefix("https://")
    return (
        f'  <section class="pool{" pool--far" if far else ""}" aria-labelledby="spring-{e(sp["id"])}">\n'
        f'    <h2 class="pool__name" id="spring-{e(sp["id"])}"><a href="{e(sp["home"])}">{e(sp["site"])}</a></h2>\n'
        f'    <p class="pool__what">{e(sp["note"])}</p>\n'
        f'    <ol class="deposits">\n' + "\n".join(rows) + "\n    </ol>\n"
        f'    <p class="pool__plate"><span>Spring: <a href="{e(sp["feed"])}">{e(feed_short)}</a></span>'
        f'<span>Read at {stamp(sp["read"])}</span>'
        f'<span><a href="https://github.com/{e(sp["repo"])}">the repository</a></span></p>\n'
        f"  </section>\n"
    )


def check_mirror(springs):
    page = MIRROR / "pages" / "feeds.md"
    if not page.exists():
        print("  (the Knowledge System mirror is not on this machine, so the springs were not "
              "checked against stimpunks.org's feeds page)")
        return
    listed = list(dict.fromkeys(re.findall(r"https://github\.com/Stimpunks/[A-Za-z0-9_.-]+/commits[a-z/]*\.atom",
                                           page.read_text())))
    ours = [sp["feed"] for sp in springs]
    if listed != ours:
        die("the springs are not stimpunks.org's commit feeds in its order.\n"
            f"  its feeds page: {listed}\n  the-source.json: {ours}\n"
            "The order and the list are that page's, decided there; follow it.")


def check_skip(skip):
    subjects = []
    for sh in sorted((ROOT / "tools").glob("daily-*.sh")):
        subjects += re.findall(r'git commit[^\n]*?-m "([^"$]+)"', sh.read_text())
    if not subjects:
        die("found no subject in tools/daily-*.sh to check the skip pattern against.")
    missed = [s for s in subjects if not skip.search(s)]
    if missed:
        die(f"the skip pattern {skip.pattern!r} misses the morning timers' {missed}.\n"
            "Every one of those mornings would put its commits on the terraces and the channel.")


def write_bot(springs, skip):
    begin = ("/* feed-bot:the-source:begin -- written by tools/make-the-source.py from "
             "data/the-source.json. Do not hand-edit. */")
    end = "/* feed-bot:the-source:end */"
    src = LIB.read_text()
    if src.count(begin) != 1 or src.count(end) != 1:
        die(f"{LIB.relative_to(ROOT)} has no single feed-bot:the-source pair, so The Source's "
            "channel would not hear its own springs.")
    rows = ",\n".join("  " + json.dumps({k: sp[k] for k in ("id", "site", "repo", "feed")}, ensure_ascii=False)
                      for sp in springs)
    block = (f"const SOURCE_SPRINGS = [\n{rows},\n];\n"
             f"const SOURCE_SKIP = new RegExp({json.dumps(skip.pattern)});\n")
    a, b = src.index(begin) + len(begin), src.index(end)
    LIB.write_text(src[:a] + "\n" + block + src[b:])


def check_bot_rooms():
    """The rooms with a feed bot, in lib.mjs and in cb.js's copy, and the two
    pages they are, must agree, or a radio would hide Follow in a room whose
    arrivals tell only a device that follows it by name."""
    lib = LIB.read_text()
    m = re.search(r"export const FEED_NAMES = \{([^}]*)\}", lib)
    cb = re.search(r"var BOT_ROOMS = \[([^\]]*)\]", (ROOT / "cb.js").read_text())
    if not m or not cb:
        die("lib.mjs has no FEED_NAMES, or cb.js no BOT_ROOMS.")
    tags = re.findall(r"'([a-z0-9-]+)':", m.group(1))
    if tags != re.findall(r"'([a-z0-9-]+)'", cb.group(1)):
        die(f"cb.js's BOT_ROOMS is not lib.mjs's FEED_NAMES ({tags}).")
    for t in tags:
        if not (ROOT / f"{t}.html").exists():
            die(f"FEED_NAMES names {t}, which is no page.")


def main():
    check_bot_rooms()
    data = json.loads(DATA.read_text())
    springs = data["springs"]
    skip = re.compile(data["skip"])
    check_skip(skip)
    check_mirror(springs)
    if not data.get("set"):
        die("data/the-source.json has no `set` time. Run tools/pull-source.py first.")
    ids = [sp["id"] for sp in springs]
    if len(set(ids)) != len(ids):
        die("two springs share an id.")
    for sp in springs:
        for k in ("id", "site", "repo", "home", "feed", "note", "read"):
            if not sp.get(k):
                die(f"spring {sp.get('id') or sp!r} is missing {k}.")
        if not sp.get("items"):
            die(f"spring {sp['id']} has no deposits. Run tools/pull-source.py.")
        commit = re.compile(rf"^https://github\.com/{re.escape(sp['repo'])}/commit/([0-9a-f]{{40}})$")
        for it in sp["items"]:
            for fld in BODY_FIELDS:
                if fld in it:
                    die(f"spring {sp['id']}: a deposit carries a `{fld}` field.\n"
                        "A deposit is a commit's first line, its id, its time, whose hands and where it goes. "
                        "The rest of the message\nis one press away, where it was written. Take the field out.")
            m = commit.match(it.get("url", ""))
            if not m:
                die(f"spring {sp['id']}: {it.get('title')!r} is not a commit in {sp['repo']}.")
            if it.get("sha") != m.group(1)[:7]:
                die(f"spring {sp['id']}: {it.get('title')!r} carries a short id that is not its commit's.")
            if skip.search(it.get("title", "")):
                die(f"spring {sp['id']}: {it['title']!r} is a morning timer's commit, which the terraces leave off.")
            if not isinstance(it.get("by"), list) or any("@" in b for b in it["by"]) \
                    or (not it["by"] and not it.get("anon")):
                die(f"spring {sp['id']}: {it.get('title')!r} names its hands wrongly; names only, never an address.")
        dates = [it["date"] for it in sp["items"]]
        if dates != sorted(dates, reverse=True):
            die(f"spring {sp['id']}: the deposits are not newest first.")

    src = PAGE.read_text()
    prose = re.sub(r"<[^>]+>", " ", re.sub(r"<!-- source:hall:begin -->.*?<!-- source:hall:end -->", " ", src, flags=re.S))
    rank = re.compile(arrivals.RANK.pattern + r"|\b(?:most|fewest) commits\b|\btop (?:committer|contributor)s?\b", re.I)
    rank_ok = re.compile(rf"\b{arrivals.NEGATION}\b[^.]{{0,80}}?(?:{rank.pattern})", re.I)
    for m in rank.finditer(prose):
        if not rank_ok.search(prose[max(0, m.start() - 120):m.end()]):
            die(f"the-source.html says “{m.group(0)}”.\nNothing on the terraces is ranked and nobody's "
                "commits are counted: a board of who did the most work turns the making into a race.")

    src = slot(src, "draw", hillside())
    src = slot(src, "hall", "".join(pool(sp, i % 2) for i, sp in enumerate(springs)))
    PAGE.write_text(src)
    write_bot(springs, skip)
    print(f"Set {PAGE.relative_to(ROOT)}: {len(springs)} springs, read at {data['set']}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
