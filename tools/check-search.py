#!/usr/bin/env python3
"""Hold the chat page's search to what it promises.

Ryan's ask, 2026-10-27: search and filters on the chat page, like Discord's
(from:, mentions:, has:, in:, before:, after:, during:, author-type:). The
server's half is searchChannels() in netlify/cb/lib.mjs and /cb/search; the
page's is the search part of cb.js (searchMake and what follows it). What they
promise, on the privacy page (#chat-search) and in the CB guide (#chat-search):

  · ONLY WHAT THE ASKER COULD ALREADY READ. Every channel they can hear: never
    a room that keeps to itself (quietRoom), even for somebody who may go in,
    because a search lists results by room and a quiet room's tag is its
    address; never a room they may not enter (roomAllows); and never a staff
    room's channel while it is shut (staffShut). Never direct messages.
  · NOTHING KEPT, AND THE WORDS NEVER IN AN ADDRESS. /cb/search is a POST, so
    the words are in its body; nothing in the search writes to the store or
    logs; the page keeps them in no storage, no history and no address.
  · NO COUNT. The answer is a page of results and whether there are more,
    never how many, and the page says its order, never a number of matches.

The friendly edits are "N results" at the top of the list, keeping recent
searches "so people can run them again", a search in the address "so it can be
shared", and searching every channel on the street "because they are all on
the server anyway". Each is refused here.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
problems = []


def refuse(msg):
    problems.append(msg)


def uncomment(s):
    return re.sub(r"(?m)^\s*//.*$", "", re.sub(r"/\*.*?\*/", "", s, flags=re.S))


def between(src, start, end, where):
    i = src.find(start)
    j = src.find(end, i + 1) if i >= 0 else -1
    if i < 0 or j < 0:
        refuse(f"{where}: cannot find the search ({start!r} to {end!r}).")
        return ""
    return src[i:j]


def main():
    lib = uncomment((ROOT / "netlify/cb/lib.mjs").read_text())
    part = between(lib, "export const SEARCH_PAGE", "export async function searchChannels", "lib.mjs")
    fn = between(lib, "export async function searchChannels", "\n}\n", "lib.mjs")
    whole = part + fn

    # Only what the asker could read already.
    if "!roomTag(tag) || quietRoom(tag) || !roomAllows(who, tag) || staffShut(tag)" not in fn:
        refuse("searchChannels no longer leaves out every quiet room, every room the asker may not enter, and every shut staff room.")
    if re.search(r"\b(dm|Dm|DM|conv|getDm|readConv)\w*\(", fn):
        refuse("searchChannels reads direct messages: the search is the channels', and a conversation is not one.")
    if "WORLD_CALL" not in fn or "readChannel(" not in fn or "readRoomTalk(" not in fn:
        refuse("searchChannels no longer reads World and the rooms' channels the way a listen does.")

    # Nothing kept, nothing logged.
    for pat, why in [(r"\bconsole\.", "logs"), (r"\bs\.(?:set|setJSON|delete)\(", "writes to the store"),
                     (r"\bupdate(?:Doc|Log|List|Sealed|RoomTalk|Channel|Tuned)\(", "writes to the store")]:
        if re.search(pat, whole):
            refuse(f"the search in lib.mjs {why}: nothing is kept for a search and nothing records who searched for what.")

    # No count.
    if re.search(r"\b(?:total|count|matched|hits)\s*:", fn):
        refuse("searchChannels answers with a count: it sends a page and whether there are more, never how many.")
    if "results:" not in fn or "more:" not in fn:
        refuse("searchChannels no longer answers with results and more.")

    # The function: a POST, nothing logged.
    f = uncomment((ROOT / "netlify/functions/cb-search.mjs").read_text())
    if "method: 'POST'" not in f:
        refuse("/cb/search is not a POST: the words would travel in an address, into logs and history.")
    if "console." in f:
        refuse("/cb/search logs: nothing a person types is ever logged.")
    if "readPass(req)" not in f or "sameSite(req)" not in f:
        refuse("/cb/search no longer asks for a pass from this site.")

    # The page.
    cb = uncomment((ROOT / "cb.js").read_text())
    page = between(cb, "var SEARCH_HAS = ", "Radio.prototype.jumpLand = function", "cb.js")
    if "call('/cb/search', { body: q }" not in page:
        refuse("cb.js no longer sends the search in a POST's body.")
    for pat, why in [(r"\b(?:localStorage|sessionStorage|indexedDB)\b", "keeps it in the browser's storage"),
                     (r"\bsave\(", "keeps it in love-cb"),
                     (r"\bhistory\.(?:push|replace)State\b|\blocation\.(?:hash|href|search)\s*=", "puts it in the address"),
                     (r"\bchatGo\(\s*(?:q|words|this\.searchQ)", "puts it in the address")]:
        if re.search(pat, page):
            refuse(f"cb.js's search {why}: the words are this page's until it goes, and never in its address.")
    if re.search(r"(?:results|list|hits)\.length\s*\+\s*'|'\s*\+\s*(?:results|list|hits)\.length|\b(?:N|\d+) results?\b", page):
        refuse("cb.js's search says how many matched: the radio never counts.")

    # The words the page and the server agree on, and the promises written down.
    for page_name, anchor in (("privacy.html", 'id="chat-search"'), ("cb-guide.html", 'id="chat-search"')):
        if anchor not in (ROOT / page_name).read_text():
            refuse(f"{page_name} lost its section on the chat page's search ({anchor}).")

    if problems:
        print("check-search: the chat page's search would break a promise:")
        for p in problems:
            print("  ·", p)
        sys.exit(1)
    print("search: only the channels you can hear, nothing kept, never in an address, and never a count.")


if __name__ == "__main__":
    main()
