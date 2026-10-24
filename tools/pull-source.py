#!/usr/bin/env python3
"""Read every repository's commit feed on GitHub and write what is on them into
data/the-source.json, for The Source's terraces.

pull-arrivals.py's twin, and kept apart from make-the-source.py for that tool's
reason: this is the half that touches the network, and a build that cannot run
on a train is a build that stops being run. make-the-source.py draws the pools
out of the file this writes and needs nothing but the file. DO NOT MERGE THEM.

WHICH FEEDS. The ones stimpunks.org's own feeds page lists under Latest Commits
to Our Repositories, in that page's order, which is a curation decision made
there: https://stimpunks.org/feeds/. The `springs` list in the data file is
hand-kept, like The Feed's wires, and this tool never invents one.

WHAT IT TAKES OFF EACH COMMIT: the first line of its message, its address, its
time, its short id, who made it, and anybody its message names in a
Co-Authored-By line, by name and never by address. GitHub names an author only
when the address a commit was made with belongs to an account, and otherwise
sends the address with an empty name; the address is never read, and the row
says somebody GitHub does not name made it (`anon`), before anybody the
message credits, so a co-author is never left standing as the only hands. NOTHING ELSE: not the rest of
the message, which is what make-the-source.py refuses as a summary field. A
deposit on a terrace is a name, a time, whose hands and where it goes; the rest
of the message is one press away on GitHub, which is where it was written.

WHY IT READS THE CO-AUTHORS. Attribution is the one habit this street kept when
it dropped the others, and most of the commits to these repositories are made by
a person with Claude, which says so in the message. GitHub's feed names only the
first; a row that named only that one would be the street's own pages taking
less care over credit than GitHub does.

WHAT IT LEAVES OFF: the morning timers' own commits ("daily arrivals board
reset" and the rest), by the `skip` pattern in the data file. Those are a
machine re-reading feeds, not anybody's work, and the Knowledge System's
update-logs skips them for the same reason. make-the-source.py checks the
pattern against every subject the tools/daily-*.sh scripts commit under.

WHAT IT REFUSES, each for pull-arrivals.py's reason:

  · A FEED THAT DID NOT ANSWER 200, or that is not Atom from GitHub.
  · AN ENTRY WITH NO ID, LINK, TITLE OR TIME.
  · AN ENTRY WHOSE LINK IS NOT A COMMIT IN THAT SPRING'S OWN REPOSITORY, which
    is make-hermitage.py's rule about the Star Stuff bench: a pool with a name
    on it holding somebody else's water reads as a claim.
"""
import html
import json
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "the-source.json"

# How many deposits a pool shows: The Feed's six, because a board and a terrace
# are both something somebody reads rather than scrolls past.
ROWS = 6

A = "{http://www.w3.org/2005/Atom}"
UA = "Stimpunks.World, The Source (+https://stimpunks.world/the-source.html)"
COAUTHOR = re.compile(r"^\s*Co-Authored-By:\s*(.+?)\s*(?:<[^>]*>)?\s*$", re.I | re.M)


def die(msg):
    raise SystemExit(f"REFUSING: {msg}")


def fetch(url):
    """curl, as pull-foundry.py does, so a proxy the shell knows is the one used."""
    p = subprocess.run(["curl", "-sS", "-m", "30", "-A", UA, "-H", "Accept: application/atom+xml",
                        "-w", "\n%{http_code}", url], capture_output=True, text=True)
    if p.returncode != 0:
        die(f"{url} could not be read: {p.stderr.strip()}")
    body, _, code = p.stdout.rpartition("\n")
    if code != "200":
        die(f"{url} answered {code}.")
    return body


def coauthors(content, first):
    """The names a commit's message gives in Co-Authored-By lines, in order,
    each once, and never the first author again. Addresses are dropped."""
    text = html.unescape(re.sub(r"<[^>]+>", "", html.unescape(content or "")))
    out = []
    for m in COAUTHOR.finditer(text):
        name = m.group(1).strip()
        if name and name.lower() != (first or "").lower() and name not in out:
            out.append(name)
    return out


def parse(xml, spring, skip):
    try:
        root = ET.fromstring(xml)
    except ET.ParseError as e:
        die(f"{spring['feed']} is not parseable XML: {e}")
    if root.tag != A + "feed":
        die(f"{spring['feed']} is <{root.tag}> and not Atom.")
    repo = spring["repo"]
    commit = re.compile(rf"^https://github\.com/{re.escape(repo)}/commit/([0-9a-f]{{40}})$")
    out = []
    for e in root.findall(A + "entry"):
        eid = (e.findtext(A + "id") or "").strip()
        title = " ".join((e.findtext(A + "title") or "").split())
        when = (e.findtext(A + "updated") or "").strip()
        link = ""
        for l in e.findall(A + "link"):
            if l.get("rel", "alternate") == "alternate":
                link = (l.get("href") or "").strip()
        if not (eid and title and when and link):
            die(f"{spring['feed']}: an entry is missing its id, title, time or link.")
        m = commit.match(link)
        if not m:
            die(f"{spring['feed']}: {title!r} links to {link}, which is not a commit in {repo}.\n"
                "A pool with somebody's name on it holding somebody else's water reads as a claim.")
        if skip.search(title):
            continue
        try:
            dt = datetime.fromisoformat(when.replace("Z", "+00:00"))
        except ValueError:
            die(f"{spring['feed']}: {title!r} has an unreadable time {when!r}.")
        # GitHub names a commit's author only when the address it was made
        # with belongs to an account, and otherwise sends an empty name and
        # the ADDRESS. The address is never read: the row says GitHub named
        # nobody, rather than publishing somebody's email to name them.
        author = " ".join((e.findtext(f"{A}author/{A}name") or "").split())
        out.append({
            "title": title,
            "url": link,
            "date": dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "sha": m.group(1)[:7],
            "by": ([author] if author else []) + coauthors(e.findtext(A + "content"), author),
        })
        if not author:
            out[-1]["anon"] = True
    # Sorted here rather than trusted: the Doomscroll's rule.
    out.sort(key=lambda i: i["date"], reverse=True)
    return out[:ROWS]


def main():
    data = json.loads(DATA.read_text())
    skip = re.compile(data["skip"])
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%MZ")
    for sp in data["springs"]:
        for k in ("id", "site", "repo", "home", "feed", "note"):
            if not sp.get(k):
                die(f"a spring is missing {k}: {sp.get('id') or sp}")
        items = parse(fetch(sp["feed"]), sp, skip)
        if not items:
            die(f"{sp['feed']} has no commits on it that are not the morning timers'.")
        sp["items"] = items
        sp["read"] = now
        print(f"  {sp['site']:<34} {len(items)} rows, newest {items[0]['date'][:10]}")
    data["set"] = now
    DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"\nWrote {DATA.relative_to(ROOT)} — read at {now}.")
    print("Now run tools/make-the-source.py to draw the pools.")


if __name__ == "__main__":
    sys.exit(main())
